import legacyMap from 'constants/legacyCategoryRedirects.json'

/**
 * Old browse URLs used the legacy pseudo-tag categories (/hdris/outdoor/night). Those tags are now
 * split between real categories and attributes, so every old URL is permanently redirected to its
 * closest equivalent instead of 404ing.
 *
 * A legacy path can contain several tags. We merge them: the deepest category wins, and every
 * attribute tag becomes a query parameter - so /hdris/outdoor/night lands on
 * /hdris?indoor=false&time_of_day=night.
 */

type LegacyTarget = { cat?: string; attr?: Record<string, string>; root?: boolean }

const MAP: Record<string, Record<string, LegacyTarget>> = legacyMap as any

// Old category names contained spaces ("man made"), so segments may or may not still be encoded.
// A malformed escape sequence must not throw the whole page.
export const safeDecode = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const isLegacyCategory = (assetType: string, segment: string): boolean =>
  Boolean(MAP[assetType] && MAP[assetType][safeDecode(segment).toLowerCase()])

/**
 * Build the redirect destination for a legacy browse URL.
 * Returns null when none of the segments are recognised (the caller should 404).
 */
export const resolveLegacyRedirect = (
  assetType: string,
  segments: string[],
  query: Record<string, any> = {}
): string | null => {
  const typeMap = MAP[assetType]
  if (!typeMap || !segments || !segments.length) return null

  let category: string | null = null
  const attrs: Record<string, string> = {}
  let matched = false

  for (const raw of segments) {
    const key = safeDecode(String(raw)).toLowerCase()
    const target = typeMap[key]
    if (!target) continue
    matched = true
    if (target.cat) category = target.cat // deepest wins - later segments are more specific
    if (target.attr) Object.assign(attrs, target.attr)
  }

  if (!matched) return null

  // Preserve the query params the old URL carried (search, author, sort...).
  const carried: Record<string, string> = {}
  for (const [k, v] of Object.entries(query || {})) {
    if (k === 'assets' || v === undefined || v === null || v === '') continue
    carried[k] = Array.isArray(v) ? v.join(',') : String(v)
  }

  const params = new URLSearchParams({ ...carried, ...attrs })
  const qs = params.toString()
  return `/${assetType}${category ? '/' + category : ''}${qs ? '?' + qs : ''}`
}
