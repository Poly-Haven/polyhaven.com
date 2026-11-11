import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'

import apiSWR from 'utils/apiSWR'

/**
 * One spelling of a query, shared by everything that has to agree on what "the same search" means:
 * the string sent to /search, the text currently typed, and the term queued for tracking. Collapsed
 * and lower-cased so equivalent queries also share one Cloudflare cache entry.
 */
export const normaliseQuery = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase()

const HANG_MS = 20000
const responseIsSearchResult = (r) => Boolean(r && typeof r.query === 'string' && Array.isArray(r.results))

/**
 * Free-text search over an already-scoped set of assets: the library grid's search, shared with the
 * HDRI map so both answer a query the same way.
 *
 * `data` is the { slug: asset } map the caller is showing (already narrowed by category, attribute,
 * collection, ...). Returns:
 *  - searchQuery: the normalised term actually searched.
 *  - semanticKeys: the api's ordered slugs for that term, limited to `data`; null while waiting.
 *  - searchFailed: /search is broken (not merely slow) for this term.
 *  - fuseKeys: a client-side Fuse.js answer, computed only when searchFailed.
 */
export const useAssetSearch = (assetType: string, search: string, data: Record<string, any> | null) => {
  // Sent to /search as-is. Deliberately NOT the string handed to Fuse below, which is rewritten into
  // extended-search syntax (space -> OR, + -> AND).
  const searchQuery = normaliseQuery(search)

  // keepPreviousData means the grid keeps showing the last result set while the next query is in
  // flight, instead of emptying out on every debounce tick.
  const { data: searchData, error: searchError } = apiSWR(
    searchQuery ? `/search?t=${assetType}&q=${encodeURIComponent(searchQuery)}&future=true` : null,
    { revalidateOnFocus: false, keepPreviousData: true }
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
    if (!searchQuery || !searchData || !Array.isArray(searchData.results) || !data) return null
    // The response echoes the query it answered. keepPreviousData hands back the previous term's
    // results while a new request is in flight, and those must not be mistaken for this term's.
    if (searchData.query !== searchQuery) return null
    return searchData.results.map((row) => row.slug).filter((slug) => slug in data)
  }, [searchQuery, searchData, data])

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
  const fuseKeys = useMemo(() => {
    if (!searchFailed || !search || !data) return null
    const fuse = new Fuse(Object.values(data), {
      keys: ['categories', 'tags', 'name'],
      includeScore: true,
      useExtendedSearch: true,
      threshold: 0.2,
    })
    let query = search
    query = query.replace(/ /g, '|') // Use spaces as OR operation
    query = query.replace(/\+/g, ' ') // Use + as AND operation
    const slugs = Object.keys(data)
    return fuse.search(query).map((sr) => slugs[sr.refIndex])
  }, [searchFailed, search, data])

  return { searchQuery, semanticKeys, searchFailed, fuseKeys }
}
