// Versions for every image that is NOT attached to an asset: site_images/, vaults/, collections/,
// corporate_sponsors/, people/ and misc/. Asset images take their version from the asset's own
// `img_version` field instead, which arrives with the asset data and needs no separate fetch.
//
// Keys are raw storage paths exactly as cdn.polyhaven.com serves them ('site_images/home/x.jpg'),
// unencoded, so they match what utils/cdn.ts is asked to build.

export type ImageVersions = Record<string, string>

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

// Same reasoning as pages/a/[id].tsx's fetchOncePerBuild: during `next build` this is fetched from
// getStaticProps across thousands of pages and returns identical bytes every time, so fetch it
// once per worker process. Outside a build it is deliberately NOT cached - admin purges this URL
// and then triggers revalidation, and a memo here would hand that regeneration the very manifest
// the purge just replaced. Uncached is cheap: the response is small and edge-cached, and
// getStaticProps only runs on regeneration.
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
let buildCache: Promise<ImageVersions> | null = null

const fetchVersions = (): Promise<ImageVersions> =>
  fetch(`${apiBase}/image_versions`)
    .then((response) => (response.ok ? response.json() : {}))
    // Never fail a page over this. An empty manifest means unversioned image URLs, which is the
    // behaviour that predates it - a stale image is a far better outcome than a 500.
    .catch(() => ({}))

const fetchAll = (): Promise<ImageVersions> => {
  if (!isBuild) return fetchVersions()
  if (!buildCache) {
    buildCache = fetchVersions()
  }
  return buildCache
}

/**
 * Versions for the images a page actually renders.
 *
 * `prefixes` is not an optimisation detail, it is the point: the whole manifest is ~35KB of JSON,
 * and whatever this returns is serialised into that page's __NEXT_DATA__. Handing every one of
 * ~3,000 pages the full manifest would add 35KB to each, on asset pages that Next already warns
 * are over its 128KB page-data threshold - and it would ship the 333-file site_images/owls folder,
 * which the site never references, to every visitor.
 *
 * Any path prefix works, so it narrows as far as a page needs: 'site_images/icons' for the tools
 * page, or `people/${author}` to send one author's avatar version rather than all 122.
 *
 * Called with no prefixes it returns everything, which is only right for a page that genuinely
 * renders images from every folder.
 */
export const getImageVersions = async (prefixes?: string[]): Promise<ImageVersions> => {
  const all = await fetchAll()
  if (!prefixes || !prefixes.length) return all
  const out: ImageVersions = {}
  for (const [path, version] of Object.entries(all)) {
    if (prefixes.some((prefix) => path.startsWith(prefix))) {
      out[path] = version
    }
  }
  return out
}
