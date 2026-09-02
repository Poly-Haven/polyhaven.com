import React from 'react'
import { useTranslation, Trans } from 'next-i18next'
import Fuse from 'fuse.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LazyLoad from 'react-lazy-load'
import debounce from 'lodash.debounce'
import { MdSearch, MdClose } from 'react-icons/md'
import { MdWhatshot, MdEvent, MdDownload, MdStar, MdSortByAlpha, MdShuffle, MdSettings } from 'react-icons/md'

import useDivSize from 'hooks/useDivSize'
import { weightedDownloadsPerDay, downloadsPerDay } from 'utils/dateUtils'
import { titleCase } from 'utils/stringUtils'
import { shuffleArray } from 'utils/arrayUtils'
import { assetTypeName } from 'utils/assetTypeName'
import apiSWR from 'utils/apiSWR'
import useStoredState from 'hooks/useStoredState'
import { useUserPatron } from 'contexts/UserPatronContext'
import { nodeFromPath, ancestorsOf, categoryLabel } from 'utils/taxonomy'
import { filterAssets } from 'utils/assetFiltering'

import GridItem from './GridItem/GridItem'
import NewsCard from './GridItem/NewsCard'
import Breadcrumbs from './Breadcrumbs'
import Spinner from 'components/UI/Spinner/Spinner'
import Loader from 'components/UI/Loader/Loader'
import Dropdown from 'components/UI/Dropdown/Dropdown'
import Disabled from 'components/UI/Disabled/Disabled'
import Switch from 'components/UI/Switch/Switch'
import DonationBox from 'components/DonationBox/DonationBox'

import styles from './Grid.module.scss'

const Grid = (props) => {
  const { t: tc } = useTranslation('common')
  const { t: tcat } = useTranslation('categories')
  const { t } = useTranslation('library')
  const optionsRef = useRef(null)
  const { earlyAccess } = useUserPatron()
  const [delay, setDelay] = useState(false)

  let sortedKeys = []

  const [searchInputFieldText, setSearchInputFieldText] = useState(props.search)

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [eaPref, setEAPref] = useStoredState('lib_adv_eaPref', 'some')
  const [thumbSize, setThumbSize] = useStoredState('lib_adv_thumbSize', 'medium')
  const [showText, setShowText] = useStoredState('lib_adv_showText', false)
  // const [altThumbs, setAltThumbs] = useStoredState('lib_adv_altThumbs', true)  // TODO

  const { width, height } = useDivSize(optionsRef, [showAdvanced, delay])

  useEffect(() => {
    // Delay useDivSize to ensure the options bar is not covering anything.
    setTimeout(() => {
      setDelay(true)
    }, 1000)
  }, [])

  // Once we've scrolled past the banner, stick the options bar at the top
  const [noSticky, setNoSticky] = useState(props.collection || props.vault || props.banner ? true : false)
  const topOfPageRef = useRef(null)
  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = document.getElementById('mainheader').offsetHeight
      if (window.scrollY > topOfPageRef.current.offsetTop - headerHeight) {
        setNoSticky(false)
      } else {
        setNoSticky(true)
      }
    }
    handleScroll() // Check on load
    if (props.collection || props.vault || props.banner) {
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    } else {
      setNoSticky(false)
    }
  }, [props.collection, props.vault, props.banner])

  // Work around stale state issues
  const numResults = useRef(null)
  useEffect(() => {
    numResults.current = sortedKeys.length
  }, [sortedKeys])
  const refAssetType = useRef(null)
  useEffect(() => {
    refAssetType.current = props.assetType
  }, [props.assetType])
  const refCategories = useRef(null)
  useEffect(() => {
    refCategories.current = props.categoryPath ? [props.categoryPath] : []
  }, [props.categoryPath])

  const sortBy = {
    hot: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return (
          weightedDownloadsPerDay(d[b].download_count, d[b].date_published, d[b].name) -
          weightedDownloadsPerDay(d[a].download_count, d[a].date_published, d[a].name)
        )
      })
    },
    latest: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return d[b].date_published - d[a].date_published
      })
    },
    top: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return (
          downloadsPerDay(d[b].download_count, d[b].date_published) -
          downloadsPerDay(d[a].download_count, d[a].date_published)
        )
      })
    },
    downloads: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return d[b].download_count - d[a].download_count
      })
    },
    name: (d: Object) => {
      return Object.keys(d).sort((a, b) => d[a].name.localeCompare(d[b].name))
    },
    random: (d: Object) => {
      return shuffleArray(Object.keys(d))
    },
  }
  const setSort = (selectedOption) => {
    props.setSort(selectedOption)
  }

  const doTrackSearch = async (newSearchText) => {
    await fetch(`/api/trackSearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        search_term: newSearchText,
        results: numResults.current,
        type: refAssetType.current,
        categories: refCategories.current,
        session: props.libSessionID,
      }),
    })
      .then((res) => res.json())
      .then((resdata) => {
        console.log(
          `Tracked search: ${newSearchText} - this helps us learn what assets you're looking for so we can decide what to make next!`
        )
      })
  }

  const trackSearch = useCallback(
    debounce((newSearchText) => {
      if (newSearchText.length < 3) return
      doTrackSearch(newSearchText)
    }, 2000),
    []
  )

  // The input is the source of truth while typing, and the URL catches up on the debounce. Only adopt
  // an incoming value when it didn't originate here (back/forward, or a cleared search), otherwise
  // the lagging prop would overwrite what's being typed.
  const localSearchRef = useRef(props.search)
  useEffect(() => {
    if (props.search !== localSearchRef.current) {
      localSearchRef.current = props.search
      setSearchInputFieldText(props.search)
    }
  }, [props.search])

  // Ctrl-F (Cmd-F on macOS) jumps to the search box, which is what someone hitting "find" on a
  // library page almost always means. Pressing it again does nothing special: once the input has
  // focus the event is left alone and the browser's own find takes over, so the shortcut is
  // borrowed rather than taken.
  const searchInputRef = useRef(null)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return
      if (String(e.key).toLowerCase() !== 'f') return
      const input = searchInputRef.current
      if (!input || document.activeElement === input) return
      e.preventDefault()
      input.focus()
      // Select what is there so typing replaces the previous query rather than appending to it.
      input.select()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const setSearch = (event) => {
    const newSearchText = event.target.value
    localSearchRef.current = newSearchText
    // FIX: Unfortunately, if the user starts typing a lot of characters really fast
    // into the search input field, something like this:
    // "alsjdfllakjsdfkjahsdfahsdjfoijwqoeifjhweoifhuipewowjerfjwoiefhwiaeohfoawiejfew"
    // and they stop, and then start typing more weird stuff like this again,
    // they can slow down their computer + crash the page.
    // This is not really a new bug, but I don't like this behavior.
    setSearchInputFieldText(newSearchText)
    props.setSearchDebounced(newSearchText)
    trackSearch(newSearchText)
  }
  const submitSearch = (event) => {
    event.preventDefault()
  }
  const resetSearch = () => {
    localSearchRef.current = ''
    setSearchInputFieldText('')
    props.setSearchDebounced('')
  }

  const asset_type_name = assetTypeName(props.assetType)

  const activeNode = props.categoryPath ? nodeFromPath(props.assetType, props.categoryPath) : null
  const categoryTrail = activeNode ? [...ancestorsOf(props.assetType, activeNode), activeNode] : []

  const setHeaderPath = () => {
    let path = ''
    let link = ''
    if (props.collection) {
      link = `/collections/${props.collection.id}`
      path = `<a href=${encodeURI(link)}>${props.collection.name}</a> /`
    } else if (props.vault) {
      link = `/vaults/${props.vault.id}`
      path = `<a href=${encodeURI(link)}>${props.vault.name}</a> /`
    } else {
      if (props.assetType !== 'all') {
        link += `/${props.assetType}`
        path += `<a href=${encodeURI(link)}>${tc(asset_type_name)}</a> /`
      }
      for (const node of categoryTrail) {
        path += ` <a href=${encodeURI(`/${props.assetType}/${node.slugPath}`)}>${categoryLabel(tcat, node)}</a> /`
      }
    }
    document.getElementById('header-frompath').innerHTML = path.trim()
  }

  const blurUpcoming = !earlyAccess

  // Fetch every asset of this type once, then narrow it down in the browser. The category tree and
  // attribute facets share this exact request (SWR dedupes), which keeps their counts consistent
  // with the grid and makes filtering instant.
  const { data: publicData, error: publicError } = apiSWR(`/assets?t=${props.assetType}&future=true`, {
    revalidateOnFocus: false,
  })
  // Sent to /search as-is. Deliberately NOT the string handed to Fuse below, which is rewritten into
  // extended-search syntax (space -> OR, + -> AND). Lower-cased and collapsed so equivalent queries
  // share one Cloudflare cache entry.
  const searchQuery = (props.search || '').replace(/\s+/g, ' ').trim().toLowerCase()

  // keepPreviousData means the grid keeps showing the last result set while the next query is in
  // flight, instead of emptying out on every debounce tick.
  const { data: searchData, error: searchError } = apiSWR(
    searchQuery ? `/search?t=${props.assetType}&q=${encodeURIComponent(searchQuery)}&future=true` : null,
    { revalidateOnFocus: false, keepPreviousData: true }
  )

  const data = useMemo(
    () =>
      publicData && !publicError
        ? filterAssets(publicData, {
            categoryPath: props.categoryPath,
            attributes: props.attributes,
            collection: props.collection ? props.collection.id : null,
            vault: props.vault ? props.vault.id : null,
            assetType: props.assetType,
          })
        : {},
    [publicData, publicError, props.categoryPath, props.attributes, props.collection, props.vault, props.assetType]
  )

  /**
   * The ordered slugs for the term currently typed, or null if we do not have them yet.
   *
   * Null means "no answer for this term yet", which renders as a spinner. While merely waiting, the
   * grid shows nothing that looks like an answer - not Fuse's, not the previous term's - because
   * both produce results that appear, settle, and are then replaced by a different set. Only a
   * genuinely BROKEN api hands over to Fuse. See searchFailed below.
   *
   * The api's list is intersected with `data` rather than replacing it, so every client-side scope
   * (collection, vault, category, attribute) stays correct without /search knowing about any of them.
   *
   * Ranking is entirely the api's: it fuses semantic and keyword rankings and pins exact matches
   * server-side, so the Blender add-on and any third party get the same order rather than each
   * reinventing it. Nothing here reorders the list - it only drops what this page is not showing.
   */
  const semanticKeys = useMemo(() => {
    if (!searchQuery || !searchData || !Array.isArray(searchData.results)) return null
    // The response echoes the query it answered. keepPreviousData hands back the previous term's
    // results while a new request is in flight, and those must not be mistaken for this term's.
    if (searchData.query !== searchQuery) return null
    return searchData.results.map((row) => row.slug).filter((slug) => slug in data)
  }, [searchQuery, searchData, data])

  // The input is the immediate truth, and props.search lags it by the 300ms URL debounce. Without
  // the grid keeps rendering the whole unfiltered library for those 300ms and then swaps - another
  // "results appear, then change" transition, just from a different source.
  const typedQuery = (searchInputFieldText || '').replace(/\s+/g, ' ').trim().toLowerCase()
  const searchSettling = Boolean(typedQuery && typedQuery !== searchQuery)

  /**
   * Is /search actually broken, as opposed to merely slow? Only the former hands over to Fuse -
   * search should survive the api being down, but a slow response must wait rather than switch
   * engines, which is what made results appear and then change.
   *
   * Three real signals, no timers among them:
   *  - SWR error: the fetch rejected, or utils/fetcher's res.json() choked on a non-JSON body.
   *    That covers the 400/429/503/500-HTML cases, since those routes reply in plain text.
   *  - A 200 whose body is not a search result. fetcher has no res.ok check, so a JSON error
   *    payload resolves happily, and without this it would spin forever instead of falling back.
   *  - A hang: no response and no error, since Chrome will not give up for ~30s.
   *
   * That last one used to be 10s, described here as "about eight times the worst latency measured,
   * so it cannot fire on a working request". Both halves were wrong. Cold queries measured 1.4s
   * median and 8.8s max against a local api with no TLS, no network and no Cloudflare hop, so 10s
   * was 88% of the budget rather than an eighth of it. And the api's ceiling is higher than the
   * client's patience by design: utils/workersAI.js retries the embed twice at 8s each with 400ms
   * between, and embeddingIndex's build runs after that rather than alongside it, so a correct 200
   * can legitimately take ~21s. A timer under that discards good answers instead of catching hangs.
   *
   * So: 20s, past the embed budget, and the latch now clears on success. The clear is the important
   * half - hungQuery was previously only ever set, and unlike searchError, which SWR drops on the
   * next success, nothing reset it. One slow response made that exact term Fuse-only for the rest of
   * the visit even once the api was answering again. With the clear, a spurious fire self-corrects
   * as soon as the real results land, which also makes the exact timeout much less load-bearing.
   */
  const HANG_MS = 20000
  const responseIsSearchResult = (r) => Boolean(r && typeof r.query === 'string' && Array.isArray(r.results))
  const [hungQuery, setHungQuery] = useState(null)
  useEffect(() => {
    // Setting it to the same null is a no-op in React, so this cannot loop.
    if (semanticKeys) {
      setHungQuery(null)
      return
    }
    if (!searchQuery || searchError) return
    const timer = setTimeout(() => setHungQuery(searchQuery), HANG_MS)
    return () => clearTimeout(timer)
  }, [searchQuery, searchError, semanticKeys])

  const searchFailed = Boolean(
    searchQuery && (searchError || (searchData && !responseIsSearchResult(searchData)) || hungQuery === searchQuery)
  )

  // Fuse now exists for exactly one reason: /search being broken. It is not an alternative engine
  // and not a placeholder for latency.
  const useFuse = searchFailed

  // No answer for what is currently typed, and nothing broken. Shows the spinner, and keeps the
  // "No results" copy from claiming an empty library before there is anything to claim it about.
  const searchPending = Boolean(!searchFailed && (searchSettling || (searchQuery && !semanticKeys)))

  if (data) {
    sortedKeys = sortBy[props.sort](data)
  } else {
    console.error({ publicError })
  }

  if (searchSettling && data) {
    // Typed but not yet searched: show the spinner, not the library the user has already left behind.
    sortedKeys = []
  } else if (props.search && data) {
    if (!useFuse) {
      // Empty while pending, which renders as the spinner below rather than as any stand-in answer.
      sortedKeys = semanticKeys || []
    } else {
      const fuse = new Fuse(Object.values(data), {
        keys: ['categories', 'tags', 'name'],
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.2,
      })
      let search = props.search
      search = search.replace(/ /g, '|') // Use spaces as OR operation
      search = search.replace(/\+/g, ' ') // Use + as AND operation
      const searchResults = fuse.search(search)
      sortedKeys = searchResults.map((sr) => Object.keys(data)[sr.refIndex])
    }
    if (props.strictSearch) {
      // Used to remove results that don't have a tag that exactly matches the search term.
      // Applied to whichever result set we ended up with, so ?strict= behaves the same either way.
      sortedKeys = sortedKeys.filter((k) => data[k]['tags'].includes(props.search))
    }
  }

  if (props.author) {
    sortedKeys = sortedKeys.filter((k) => Object.keys(data[k].authors).includes(props.author))
  }

  if (blurUpcoming && !props.vault) {
    if (width <= 810 || eaPref === 'none') {
      sortedKeys = sortedKeys.filter((k, i) => {
        return data[k].date_published <= Math.floor(Date.now() / 1000)
      })
    } else if (eaPref === 'some') {
      sortedKeys = sortedKeys.filter((k, i) => {
        return i < 3 || data[k].date_published <= Math.floor(Date.now() / 1000)
      })
    }
  }

  const resetNews = () => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('newsHide__')) {
        localStorage.removeItem(key)
      }
    }
    window.location.reload()
  }

  const sortOptions = {
    hot: {
      label: t('library:sort.hot'),
      tooltip: t('library:sort.hot-d'),
      icon: <MdWhatshot />,
    },
    top: {
      label: t('library:sort.top'),
      tooltip: t('library:sort.top-d'),
      icon: <MdStar />,
    },
    downloads: {
      label: t('library:sort.downloads'),
      tooltip: t('library:sort.downloads-d'),
      icon: <MdDownload />,
    },
    latest: {
      label: t('library:sort.latest'),
      tooltip: t('library:sort.latest-d'),
      icon: <MdEvent />,
    },
    name: {
      label: t('library:sort.name'),
      tooltip: t('library:sort.name-d'),
      icon: <MdSortByAlpha />,
    },
    random: {
      label: t('library:sort.random'),
      tooltip: t('library:sort.random-d'),
      icon: <MdShuffle />,
    },
  }

  return (
    <>
      <div ref={topOfPageRef} />
      <div className={`${styles.optionsBar} ${noSticky ? styles.noSticky : ''}`} ref={optionsRef}>
        <div className={styles.gridHeaderWrapper}>
          <div className={styles.gridHeader}>
            <div className={styles.gridTitle}>
              <Breadcrumbs
                assetType={props.assetType}
                assetTypeLabel={tc(asset_type_name)}
                categoryPath={props.categoryPath}
                author={props.author}
                setAuthor={props.setAuthor}
                collection={props.collection}
                vault={props.vault}
                tcat={tcat}
                t={t}
              />
            </div>
            <div className={styles.options}>
              <div className={styles.advWrapper}>
                <div
                  className={`${styles.advButton} ${showAdvanced ? styles.active : ''}`}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <MdSettings />
                </div>
              </div>
              <div className={styles.menuSelection}>
                <Disabled disabled={Boolean(props.search)} tooltip={t('library:sort.relevance')} tooltipSide={'bottom'}>
                  <Dropdown value={props.sort} options={sortOptions} label={t('library:sort-by')} onChange={setSort} />
                </Disabled>
              </div>
              <div className={styles.search}>
                <MdSearch className={styles.searchIcon} />
                <form onSubmit={submitSearch}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('library:search-placeholder')}
                    value={searchInputFieldText}
                    onChange={setSearch}
                  />
                </form>
                {props.search ? <MdClose className={styles.resetSearchIcon} onClick={resetSearch} /> : null}
              </div>
              {
                <p className={styles.numResults} aria-busy={searchPending}>
                  {searchPending ? <Loader /> : `${sortedKeys.length} ${t('library:results')}`}
                </p>
              }
            </div>
          </div>
        </div>
        {showAdvanced ? (
          <div className={styles.advOptions}>
            <Disabled disabled={!blurUpcoming} tooltip={t('library:adv.upcoming-patron')}>
              <div className={styles.advOpt}>
                <Dropdown
                  label={t('library:adv.upcoming')}
                  value={eaPref}
                  options={{
                    none: {
                      label: t('library:adv.upcoming-1'),
                      tooltip: t('library:adv.upcoming-1d'),
                    },
                    some: {
                      label: t('library:adv.upcoming-2'),
                      tooltip: t('library:adv.upcoming-2d'),
                    },
                    all: {
                      label: t('library:adv.upcoming-3'),
                      tooltip: t('library:adv.upcoming-3d'),
                    },
                  }}
                  onChange={setEAPref}
                />
              </div>
            </Disabled>
            <div className={styles.advOpt}>
              <Dropdown
                label={t('library:adv.thumb-size')}
                value={thumbSize}
                options={{
                  small: {
                    label: t('library:adv.thumb-size-1'),
                  },
                  medium: {
                    label: t('library:adv.thumb-size-2'),
                  },
                  large: {
                    label: t('library:adv.thumb-size-3'),
                  },
                  huge: {
                    label: t('library:adv.thumb-size-4'),
                  },
                }}
                onChange={setThumbSize}
              />
            </div>
            <div className={styles.advOpt}>
              {t('library:adv.show-names')}
              <Switch on={showText} onClick={() => setShowText(!showText)} />
            </div>
          </div>
        ) : null}
      </div>

      <div
        className={`${styles.optionsSpacer} ${noSticky ? styles.noStickySpacer : ''}`}
        style={{ marginTop: height }}
      />

      {sortedKeys.length ? (
        <>
          <div className={styles.grid}>
            {!props.vault && !props.collection ? <NewsCard isMobile={width <= 810} /> : null}
            {sortedKeys.map((asset) => {
              return (
                <React.Fragment key={asset}>
                  <LazyLoad offset={500}>
                    <GridItem
                      asset={data[asset]}
                      assetID={asset}
                      onClick={setHeaderPath}
                      blurUpcoming={blurUpcoming && eaPref !== 'all' && !props.vault}
                      thumbSize={thumbSize}
                      showText={showText}
                    />
                  </LazyLoad>
                </React.Fragment>
              )
            })}
          </div>
          <div className={styles.noResults}>
            <h3 className="red-links">
              <Trans
                i18nKey="library:no-results-fund"
                t={t}
                components={{
                  em: <em />,
                  br: <br />,
                  lnk: <a href="https://www.patreon.com/polyhaven" />,
                }}
              />
            </h3>
            <DonationBox />
          </div>
        </>
      ) : publicData && !searchPending ? (
        <div className={styles.noResults}>
          {props.search ? <p>{t('library:no-results')} :(</p> : null}
          <h3 className="red-links">
            <Trans
              i18nKey="library:no-results-fund"
              t={t}
              components={{
                em: <em />,
                br: <br />,
                lnk: <a href="https://www.patreon.com/polyhaven" />,
              }}
            />
          </h3>
          <DonationBox />
        </div>
      ) : (
        <div className={styles.loading}>
          <Spinner />
        </div>
      )}
    </>
  )
}

export default Grid
