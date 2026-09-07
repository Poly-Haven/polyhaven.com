// Every image on cdn.polyhaven.com is served with a ~1 year max-age and Bunny's purge is
// unreliable, so once a browser or edge node has a copy of an image it can keep serving it more or
// less forever. Changing the URL is the only thing that reliably replaces it, so image URLs carry
// a `v` parameter holding a short hash of the image's own content.
//
// Two sources of that hash, depending on the image:
//   - asset images (asset_img/...) -> the asset's `img_version` field, from the API
//   - everything else              -> the image-versions manifest, see ImageVersionsContext
//
// Bunny keys its cache on unknown query params and its Optimizer ignores them, so `v` coexists
// with width/height/quality without disturbing the resizing. `v` is deliberately not one of the
// Optimizer's own params (width, height, quality, format, aspect_ratio, crop_gravity, blur,
// sharpen, ...) so it passes through untouched.

export const CDN = 'https://cdn.polyhaven.com'
export const VERSION_PARAM = 'v'

export type CdnParams = Record<string, string | number | undefined | null>

// Values and paths are emitted verbatim rather than percent-encoded, which is deliberate on both
// counts. Params: `aspect_ratio=16:9` has to reach Bunny with its colon intact. Paths: some are
// already encoded in the source (`misc/Logo%20social%20gray.png`) and others contain raw spaces
// (`people/Sergej Majboroda.jpg`, which browsers encode themselves) - encoding here would break
// the first kind and change the second. This keeps output byte-identical to the URLs the site has
// always produced, so nothing goes cold until a version actually appears.
const buildQuery = (params?: CdnParams): string => {
  if (!params) return ''
  const parts: string[] = []
  for (const key of Object.keys(params)) {
    const value = params[key]
    if (value === undefined || value === null || value === '') continue
    parts.push(`${key}=${value}`)
  }
  return parts.join('&')
}

// `version` is optional everywhere: an asset compiled before img_version existed, or a file missing
// from the manifest, simply gets the unversioned URL it got before. That is the old behaviour
// rather than a broken one, which is what lets this be rolled out a call site at a time.
export const cdnUrl = (path: string, params?: CdnParams, version?: string): string => {
  const query = buildQuery(params)
  const v = version ? `${query ? '&' : ''}${VERSION_PARAM}=${version}` : ''
  return `${CDN}/${path}${query || v ? '?' : ''}${query}${v}`
}

// For URLs that already exist - most usefully the API's own `thumbnail_url`, which arrives already
// versioned and only needs its width/height changed. Existing params are kept unless overridden,
// so the `v` the API put there survives.
//
// This is also what AssetPage's setPreviewImage needs: it appends params to srcs that sometimes
// already carry a query string and sometimes do not, where blind concatenation yields a double '?'.
export const withParams = (url: string, params?: CdnParams): string => {
  const [base, existing] = url.split('?')
  const merged: CdnParams = {}
  if (existing) {
    for (const pair of existing.split('&')) {
      if (!pair) continue
      const eq = pair.indexOf('=')
      if (eq === -1) continue
      merged[pair.slice(0, eq)] = pair.slice(eq + 1)
    }
  }
  Object.assign(merged, params || {})
  const query = buildQuery(merged)
  return `${base}${query ? '?' + query : ''}`
}

// Strips the query so a URL can be inspected by extension. Needed because these URLs now usually
// carry ?v=<hash>, which breaks the obvious `url.endsWith('.mp4')` / `url.slice(-4)` tests - they
// see the tail of the version instead of the file type.
export const withoutQuery = (url: string): string => url.split('?')[0]

// The asset_img prefixes, so call sites name a folder instead of repeating the path shape.
export const assetImg = {
  thumb: (slug: string, params?: CdnParams, version?: string) =>
    cdnUrl(`asset_img/thumbs/${slug}.png`, params, version),
  primary: (slug: string, params?: CdnParams, version?: string) =>
    cdnUrl(`asset_img/primary/${slug}.png`, params, version),
  render: (slug: string, file: string, params?: CdnParams, version?: string) =>
    cdnUrl(`asset_img/renders/${slug}/${file}`, params, version),
  mapPreview: (slug: string, file: string, params?: CdnParams, version?: string) =>
    cdnUrl(`asset_img/map_previews/${slug}/${file}`, params, version),
  backplate: (slug: string, file: string, params?: CdnParams, version?: string) =>
    cdnUrl(`asset_img/backplates/${slug}/${file}`, params, version),
}
