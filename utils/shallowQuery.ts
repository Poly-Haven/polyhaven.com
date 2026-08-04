import type { NextRouter } from 'next/router'

/**
 * Updates the query string without navigating.
 *
 * Every library filter (category, attributes, author, search) is reflected in the URL so a view can
 * be linked and shared, but filtering itself happens client-side against the already-loaded assets.
 * Shallow routing gives us both: the URL changes, no data fetching runs.
 *
 * Dynamic route segments arrive in `router.query` alongside real query params (e.g. `assets` for
 * /[...assets], `collection` for /collections/[...collection]). They must be stripped, or Next
 * appends them to the URL as query params.
 */

const routeParamKeys = (pathname: string): string[] =>
  (pathname.match(/\[\.{0,3}[^\]]+\]/g) || []).map((token) => token.replace(/[[\].]/g, ''))

export const setQueryShallow = (
  router: NextRouter,
  mutate: (query: Record<string, any>) => void,
  { replace = false }: { replace?: boolean } = {}
) => {
  const query = { ...router.query }
  for (const key of routeParamKeys(router.pathname)) delete query[key]
  mutate(query)
  // Called as a method so the router keeps its `this` binding.
  const url = { pathname: router.asPath.split('?')[0], query }
  if (replace) router.replace(url, undefined, { shallow: true })
  else router.push(url, undefined, { shallow: true })
}
