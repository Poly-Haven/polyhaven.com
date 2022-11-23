import { useTranslation } from 'next-i18next'
import Fuse from 'fuse.js'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0'
import LazyLoad from 'react-lazy-load'
import { MdSearch, MdClose } from 'react-icons/md'
import { MdWhatshot, MdEvent, MdDownload, MdStar, MdSortByAlpha, MdShuffle, MdSettings } from 'react-icons/md'

import useDivSize from 'hooks/useDivSize'
import { weightedDownloadsPerDay, downloadsPerDay } from 'utils/dateUtils'
import { titleCase } from 'utils/stringUtils'
import { randomArraySelection, shuffleArray } from 'utils/arrayUtils'
import { assetTypeName } from 'utils/assetTypeName'
import { getPatronInfo } from 'utils/patronInfo'
import apiSWR from 'utils/apiSWR'
import useStoredState from 'hooks/useStoredState'

import GridItem from './GridItem/GridItem'
import NewsCard from './GridItem/NewsCard'
import Spinner from 'components/UI/Spinner/Spinner'
import DisplayAd from 'components/Ads/DisplayAd'
import Dropdown from 'components/UI/Dropdown/Dropdown'
import Disabled from 'components/UI/Disabled/Disabled'
import Switch from 'components/UI/Switch/Switch'

import styles from './Grid.module.scss'
import btnStyles from 'components/UI/Button/Button.module.scss'

const Grid = (props) => {
  const { t: tc } = useTranslation('common')
  const { t: tcat } = useTranslation('categories')
  const { t } = useTranslation('library')
  const optionsRef = useRef(null)
  const { user } = useUser()
  const [uuid, setUuid] = useState(null)
  const [patron, setPatron] = useState({})
  const [news, setNews] = useState(null)
  const { locale } = useRouter()

  const [searchInputFieldText, setSearchInputFieldText] = useState(props.search)

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [eaPref, setEAPref] = useStoredState('lib_adv_eaPref', 'some')
  const [thumbSize, setThumbSize] = useStoredState('lib_adv_thumbSize', 'medium')
  // const [altThumbs, setAltThumbs] = useStoredState('lib_adv_altThumbs', true)  // TODO

  const { width, height } = useDivSize(optionsRef, [showAdvanced])

  useEffect(() => {
    // Handle user loading
    if (uuid) {
      getPatronInfo(uuid).then((resdata) => {
        setPatron(resdata)
      })
    } else {
      if (user) {
        setUuid(user.sub.split('|').pop())
      }
    }
  }, [user, uuid])

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
  const setSearch = (event) => {
    const newSearchText = event.target.value
    // FIX: Unfortunately, if the user starts typing a lot of characters really fast
    // into the search input field, something like this:
    // "alsjdfllakjsdfkjahsdfahsdjfoijwqoeifjhweoifhuipewowjerfjwoiefhwiaeohfoawiejfew"
    // and they stop, and then start typing more weird stuff like this again,
    // they can slow down their computer + crash the page.
    // This is not really a new bug, but I don't like this behavior.
    setSearchInputFieldText(newSearchText)
    props.setSearchDebounced(newSearchText)
  }
  const submitSearch = (event) => {
    event.preventDefault()
  }
  const resetSearch = () => {
    setSearchInputFieldText('')
    props.setSearchDebounced('')
  }

  const asset_type_name = assetTypeName(props.assetType)

  const setHeaderPath = () => {
    let path = ''
    let link = ''
    if (props.assetType !== 'all') {
      link += `/${props.assetType}`
      path += `<a href=${encodeURI(link)}>${tc(asset_type_name)}</a> /`
    }
    for (const c of props.categories) {
      link += `/${c}`
      path += ` <a href=${encodeURI(link)}>${tcat(c)}</a> /`
    }
    document.getElementById('header-frompath').innerHTML = path.trim()
  }

  let blurUpcoming = !(patron['rewards'] && patron['rewards'].includes('Early Access'))

  let sortedKeys = []
  let data = {}
  let urlParams = `?t=${props.assetType}&future=true`
  if (props.categories.length) {
    urlParams += '&c=' + props.categories.join(',')
  }
  const { data: publicData, error: publicError } = apiSWR(`/assets${urlParams}`, { revalidateOnFocus: false })
  if (publicData && !publicError) {
    data = { ...data, ...publicData }
  }

  const { data: newsData } = apiSWR(`/news`, { revalidateOnFocus: false })
  if (newsData && !news) {
    setNews(randomArraySelection(newsData))
  }

  if (data) {
    sortedKeys = sortBy[props.sort](data)
  } else {
    console.error({ publicError })
  }

  if (props.search && data) {
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
    const filteredData = {}
    for (const sr of searchResults) {
      let srID = Object.keys(data)[sr.refIndex]
      filteredData[srID] = data[srID]
    }
    sortedKeys = Object.keys(filteredData)
  }

  if (props.author) {
    sortedKeys = sortedKeys.filter((k) => Object.keys(data[k].authors).includes(props.author))
  }

  if (blurUpcoming) {
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

  let title = tc(asset_type_name)
  if (props.categories.length) {
    title = tc(asset_type_name) + ': ' + titleCase(props.categories.map((c) => tcat(c)).join(' > '))
  }
  if (props.author) {
    title += ` (${t('by-author', { author: props.author })})`
  }
  const fSize = Math.floor(title.length / 17.5) // Rough detection of line length used to reduce font size.

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
      label: t('sort.hot'),
      tooltip: t('sort.hot-d'),
      icon: <MdWhatshot />,
    },
    top: {
      label: t('sort.top'),
      tooltip: t('sort.top-d'),
      icon: <MdStar />,
    },
    downloads: {
      label: t('sort.downloads'),
      tooltip: t('sort.downloads-d'),
      icon: <MdDownload />,
    },
    latest: {
      label: t('sort.latest'),
      tooltip: t('sort.latest-d'),
      icon: <MdEvent />,
    },
    name: {
      label: t('sort.name'),
      tooltip: t('sort.name-d'),
      icon: <MdSortByAlpha />,
    },
    random: {
      label: t('sort.random'),
      tooltip: t('sort.random-d'),
      icon: <MdShuffle />,
    },
  }

  return (
    <>
      <div className={styles.optionsBar} ref={optionsRef}>
        <div className={styles.gridHeader}>
          <div className={styles.gridTitle}>
            <h1 className={styles['s' + fSize]}>{title}</h1>
            {props.author ? <MdClose onClick={(_) => props.setAuthor(undefined)} data-tip={t('Clear author')} /> : null}
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
              <Disabled disabled={Boolean(props.search)} tooltip={t('sort.relevance')} tooltipSide={'bottom'}>
                <Dropdown value={props.sort} options={sortOptions} label={t('sort-by')} onChange={setSort} />
              </Disabled>
            </div>
            <div className={styles.search} data-tip={locale !== 'en' ? t('search-en') : null}>
              <MdSearch className={styles.searchIcon} />
              <form onSubmit={submitSearch}>
                <input type="text" placeholder="Search..." value={searchInputFieldText} onChange={setSearch} />
              </form>
              {props.search ? <MdClose className={styles.resetSearchIcon} onClick={resetSearch} /> : null}
            </div>
            {
              <p className={styles.numResults}>
                {sortedKeys.length} {t('results')}
              </p>
            }
          </div>
          <div className={styles.adGridTop}>
            <DisplayAd id="9488083725" x={468} y={60} />
          </div>
        </div>
        <div style={{ flexBasis: '100%', width: 0 }} />
        {showAdvanced ? (
          <div className={styles.advOptions}>
            <Disabled disabled={!blurUpcoming} tooltip={t('adv.upcoming-patron')}>
              <div className={styles.advOpt}>
                <Dropdown
                  label={t('adv.upcoming')}
                  value={eaPref}
                  options={{
                    none: {
                      label: t('adv.upcoming-1'),
                      tooltip: t('adv.upcoming-1d'),
                    },
                    some: {
                      label: t('adv.upcoming-2'),
                      tooltip: t('adv.upcoming-2d'),
                    },
                    all: {
                      label: t('adv.upcoming-3'),
                      tooltip: t('adv.upcoming-3d'),
                    },
                  }}
                  onChange={setEAPref}
                />
              </div>
            </Disabled>
            <div className={styles.advOpt}>
              <Dropdown
                label={t('adv.thumb-size')}
                value={thumbSize}
                options={{
                  small: {
                    label: t('adv.thumb-size-1'),
                  },
                  medium: {
                    label: t('adv.thumb-size-2'),
                  },
                  large: {
                    label: t('adv.thumb-size-3'),
                  },
                  huge: {
                    label: t('adv.thumb-size-4'),
                  },
                }}
                onChange={setThumbSize}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className={styles.optionsSpacer} style={{ marginTop: height }} />

      {sortedKeys.length ? (
        <div className={styles.grid}>
          {news ? (
            <NewsCard
              newsKey={news.key}
              topText={news.text_top}
              img={`https://cdn.polyhaven.com/site_images/news_cards/${news.image}`}
              pausedImg={
                news.image_paused ? `https://cdn.polyhaven.com/site_images/news_cards/${news.image_paused}` : null
              }
              bottomText={news.text_bottom}
              link={news.link}
              isMobile={width <= 810}
            />
          ) : null}
          {sortedKeys.map((asset) => {
            return (
              <LazyLoad offset={500} key={asset}>
                <GridItem
                  asset={data[asset]}
                  assetID={asset}
                  onClick={setHeaderPath}
                  blurUpcoming={blurUpcoming && eaPref !== 'all'}
                  thumbSize={thumbSize}
                />
              </LazyLoad>
            )
          })}
        </div>
      ) : publicData ? (
        <div className={styles.noResults}>
          <h2>{t('no-results')} :(</h2>
          {props.search ? <p>{t('no-results-keyword')}</p> : null}
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
