// SISTER COMPONENT: components/Library/Sidebar/Sidebar.tsx is the library's version of this panel.
// Both are built from the same parts - CategoryList and AttributeFilters here, and the search
// behind the box (useAssetSearch, called from MapFilters.tsx here and from the library's Grid) - so
// a change to how browsing or filtering works there - a new filter, a changed query param, a change
// to search - probably wants making here too, and the reverse.
// What differs on purpose: no asset-type switcher or contribute footer here, the search box lives
// in this panel rather than above a grid, the category lives in ?c= rather than the URL path, every
// count is scoped to the HDRIs the map plots, and the map's hamburger button opens and closes it.

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import debounce from 'lodash.debounce'
import { MdClose, MdErrorOutline, MdRefresh, MdSearch } from 'react-icons/md'

import CategoryList, { CategoryHref } from 'components/Library/Sidebar/CategoryList'
import AttributeFilters from 'components/Library/Sidebar/AttributeFilters'
import Spinner from 'components/UI/Spinner/Spinner'
import { AttributeFilters as AttributeFilterValues, filterAssets } from 'utils/assetFiltering'
import { setQueryShallow } from 'utils/shallowQuery'
import { useLazyNamespaces } from 'hooks/useLazyNamespaces'
import { MAP_HIDDEN_ATTRIBUTES } from './mapData'

import styles from './MapSidebar.module.scss'

const LAZY_NAMESPACES = ['library', 'categories']

// The map keeps its category in ?c=<slug path>, carrying every other param (filters, search, the
// open popup) along with it.
const mapCategoryHref: CategoryHref = (node, query) => {
  const next = { ...query }
  if (node) next.c = node.slugPath
  else delete next.c
  return { pathname: '/map', query: next }
}

type Props = {
  open: boolean
  focusSearch: boolean
  onEscape: () => void
  // { slug: asset } for the HDRIs on the map, or null while it loads.
  assets: Record<string, any> | null
  // The asset list couldn't be loaded; every marker stays on the map.
  failed: boolean
  onRetry: () => void
  categoryPath: string | null
  attributes: AttributeFilterValues
  author: string | null
  search: string
}

const MapSidebar = ({
  open,
  focusSearch,
  onEscape,
  assets,
  failed,
  onRetry,
  categoryPath,
  attributes,
  author,
  search,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open && focusSearch) inputRef.current?.focus({ preventScroll: true })
  }, [open, focusSearch])
  const router = useRouter()
  const ready = useLazyNamespaces(LAZY_NAMESPACES, open)
  const { t } = useTranslation(['library', 'map'])

  // The input is the source of truth while typing; the URL catches up after a pause (as in the
  // library, `replace` so typing doesn't add a history entry per pause). An incoming value is only
  // adopted when it didn't come from here - back/forward, or a cleared search.
  const [text, setText] = useState(search)
  const localRef = useRef(search)
  useEffect(() => {
    if (search !== localRef.current) {
      localRef.current = search
      setText(search)
    }
  }, [search])
  const routerRef = useRef(router)
  routerRef.current = router
  const pushSearch = useMemo(
    () =>
      debounce((value: string) => {
        setQueryShallow(
          routerRef.current,
          (query) => {
            if (value) query.s = value
            else delete query.s
          },
          { replace: true }
        )
      }, 300),
    []
  )
  useEffect(() => () => pushSearch.cancel(), [pushSearch])
  const onType = (value: string) => {
    localRef.current = value
    setText(value)
    pushSearch(value)
  }

  // Attribute counts are scoped to the chosen category, as in the library sidebar.
  const inCategory = useMemo(
    () => (assets ? filterAssets(assets, { categoryPath, assetType: 'hdris' }) : null),
    [assets, categoryPath]
  )

  return (
    <aside
      className={`${styles.panel} ${open ? styles.open : ''}`}
      aria-hidden={!open}
      onKeyDown={(e) => {
        // Not while an IME composition is open: there Escape cancels the composition.
        if (e.key !== 'Escape' || e.nativeEvent.isComposing) return
        // Not also the map's "Escape closes the popup".
        e.stopPropagation()
        onEscape()
      }}
    >
      {open && (
        <>
          <div className={styles.header}>
            <div className={styles.search}>
              <MdSearch className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                value={text}
                placeholder={ready ? t('library:search-placeholder') : ''}
                onChange={(e) => onType(e.target.value)}
                aria-label={ready ? t('library:search-placeholder') : undefined}
              />
              {text ? (
                <button
                  type="button"
                  className={styles.clearSearch}
                  onClick={() => onType('')}
                  aria-label={t('map:close')}
                >
                  <MdClose />
                </button>
              ) : null}
            </div>
          </div>
          <div className={styles.inner}>
            {failed ? (
              // English only, on purpose: this should be very rare, so it isn't worth translating.
              <div className={styles.failed}>
                <p>
                  <MdErrorOutline /> Couldn't load the filters.
                </p>
                <button type="button" onClick={onRetry} className={styles.retry}>
                  <MdRefresh /> Try again
                </button>
              </div>
            ) : assets && ready ? (
              <>
                <CategoryList
                  assetType="hdris"
                  assets={assets}
                  categoryPath={categoryPath}
                  attributes={attributes}
                  author={author}
                  categoryHref={mapCategoryHref}
                />
                <AttributeFilters
                  assetType="hdris"
                  assets={inCategory}
                  active={attributes}
                  author={author}
                  exclude={MAP_HIDDEN_ATTRIBUTES}
                />
              </>
            ) : (
              <Spinner />
            )}
          </div>
        </>
      )}
    </aside>
  )
}

export default MapSidebar
