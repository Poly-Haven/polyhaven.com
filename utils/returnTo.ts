/**
 * Where to send someone after they sign in.
 *
 * This used to ride in the header's href as /account?returnTo={current path}, which meant every
 * page of the site rendered a different sign-in URL. Cloudflare's cache key includes the query
 * string, so that was one cache object per page - measured 2026-09-09 at 186k billed requests and
 * 4 GB a day, almost none of them ever hit. The href is now a plain /account and the destination
 * is remembered on click instead.
 */

const KEY = 'ph_return_to'

/**
 * Next puts its internal catch-all param into asPath on dynamic routes (`?nxtPassets=textures`),
 * which previously leaked into the rendered URL and produced a second `?`. Strip it.
 */
export const cleanPath = (path: string): string => {
  const [base, query] = path.split('?')
  if (!query) return base
  const kept = query.split('&').filter((kv) => !kv.startsWith('nxtP'))
  return kept.length ? `${base}?${kept.join('&')}` : base
}

// sessionStorage throws outright in some privacy modes. Losing the return path is a minor
// inconvenience; throwing on a nav click is not acceptable.
export const rememberReturnTo = (path: string) => {
  try {
    sessionStorage.setItem(KEY, cleanPath(path))
  } catch {
    /* ignore */
  }
}

export const readReturnTo = (): string | null => {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}
