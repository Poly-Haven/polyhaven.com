// The map's search and filtering, and the sidebar that drives them. Loaded on demand (next/dynamic
// in Map.tsx) the first time the sidebar opens or a link arrives with filters: it pulls in the
// category taxonomy (~60KB gzipped), Fuse.js and the filter UI, which most map visits never use.
//
// It reports which HDRIs to show through `onResult`; Map.tsx does the marker work.

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'

import apiSWR from 'utils/apiSWR'
import { attributeFiltersFromQuery, filterAssets } from 'utils/assetFiltering'
import { nodeFromSlugSegments } from 'utils/taxonomy'
import { useAssetSearch } from 'hooks/useAssetSearch'

import MapSidebar from './MapSidebar'
import { MAP_HIDDEN_ATTRIBUTES } from './mapData'

export type FilterResult = {
  // Slugs to show, or null for all of them.
  visible: Set<string> | null
  // Still working it out (assets loading, search answering): keep showing what's there.
  pending: boolean
}

type Props = {
  open: boolean
  // Opened with the keyboard: focus the search box.
  focusSearch: boolean
  onEscape: () => void
  // The HDRIs the map plots.
  slugs: string[]
  onResult: (result: FilterResult) => void
}

// The /assets response is { slug: asset }. utils/fetcher doesn't check res.ok, so an error body can
// arrive as data; one with no asset records in it is treated as a failure, not as an empty library.
const looksLikeAssets = (data: any) =>
  Boolean(
    data && typeof data === 'object' && Object.values(data).some((a: any) => a && typeof a === 'object' && 'name' in a)
  )

const MapFilters = ({ open, focusSearch, onEscape, slugs, onResult }: Props) => {
  const router = useRouter()

  // Same query params as the library (?s=, ?a=, attribute keys), plus ?c= for the category, which
  // the library keeps in its path. Read from window until the router's query is ready.
  const query = router.isReady ? router.query : Object.fromEntries(new URLSearchParams(window.location.search))
  // Keyed on the filters' own values, not the whole query: ?asset= changes whenever a popup opens,
  // and a new `attributes` object would re-filter, re-fit the map and close that popup.
  const attributesKey = JSON.stringify(
    Object.fromEntries(
      Object.entries(attributeFiltersFromQuery(query, 'hdris')).filter(([key]) => !MAP_HIDDEN_ATTRIBUTES.includes(key))
    )
  )
  const attributes = useMemo(() => JSON.parse(attributesKey), [attributesKey])
  const author = typeof query.a === 'string' ? query.a : null
  const categoryPath = (typeof query.c === 'string' && nodeFromSlugSegments('hdris', query.c.split('/'))?.path) || null
  const search = typeof query.s === 'string' ? query.s : ''
  const searching = Boolean(search.trim())
  const filtering = Boolean(categoryPath || author || searching || Object.keys(attributes).length)

  // The full asset records the filters need (categories, attributes, authors) - the same request
  // the library makes, so it's often cached already.
  const { data: publicData, error, mutate } = apiSWR('/assets?t=hdris&future=true', { revalidateOnFocus: false })
  const failed = Boolean(error || (publicData && !looksLikeAssets(publicData)))

  // Just the HDRIs the map plots, so the sidebar's counts match its markers.
  const mapAssets = useMemo(() => {
    if (!publicData || failed) return null
    const out: Record<string, any> = {}
    for (const slug of slugs) if (publicData[slug]) out[slug] = publicData[slug]
    return out
  }, [publicData, failed, slugs])
  const scoped = useMemo(
    () => (mapAssets ? filterAssets(mapAssets, { categoryPath, attributes, assetType: 'hdris', author }) : null),
    [mapAssets, categoryPath, attributes, author]
  )
  const { semanticKeys, searchFailed, fuseKeys } = useAssetSearch('hdris', search, scoped)
  const searchKeys = searchFailed ? fuseKeys : semanticKeys

  const pending = filtering && !failed && (!scoped || (searching && !searchKeys))
  const visible = useMemo(() => {
    if (!filtering || failed || !scoped) return null
    if (searching) return searchKeys ? new Set<string>(searchKeys) : null
    return new Set(Object.keys(scoped))
  }, [filtering, failed, scoped, searching, searchKeys])

  useEffect(() => {
    onResult({ visible, pending })
  }, [visible, pending, onResult])

  return (
    <MapSidebar
      open={open}
      focusSearch={focusSearch}
      onEscape={onEscape}
      assets={mapAssets}
      failed={failed}
      onRetry={() => mutate()}
      categoryPath={categoryPath}
      attributes={attributes}
      author={author}
      search={search}
    />
  )
}

export default MapFilters
