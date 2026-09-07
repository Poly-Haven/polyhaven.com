import type { NextApiRequest, NextApiResponse } from 'next'
import { i18n } from '../../next-i18next.config'

/**
 * Agnostic on-demand ISR revalidation endpoint.
 *
 * Trigger a rebuild of any statically-generated page(s) the moment their
 * underlying data changes, instead of waiting for the time-based `revalidate`
 * fallback in getStaticProps.
 *
 * Auth: send the secret as `?key=...` or an `x-revalidation-key` header,
 * matched against process.env.REVALIDATION_KEY.
 *
 * Params (via query string or JSON body):
 *   path     - a single path to revalidate, e.g. "/gallery"
 *   paths    - multiple paths: array (JSON body) or comma-separated string (query)
 *   locales  - "true" to also revalidate every localized variant of each path
 *              (e.g. "/gallery" -> "/gallery", "/de/gallery", "/fr/gallery", ...)
 *
 * Examples:
 *   /api/revalidate?key=SECRET&path=/gallery&locales=true
 *   /api/revalidate?key=SECRET&paths=/gallery,/textures
 */

const { locales = [], defaultLocale } = i18n

/**
 * Drop a leading locale segment, so `locales=true` accepts a path in either form.
 *
 * admin's Cloudflare purge lists have to name every localised URL explicitly (the zone is on the
 * Pro plan, which can only purge by exact URL), and those same pathnames get handed to this
 * endpoint. Without this, "/de/a/foo" would expand to "/de/de/a/foo" — revalidating a path that
 * doesn't exist while leaving the real one stale. Normalising here rather than asking callers to
 * filter keeps the locale list in the one place that actually owns it.
 */
const stripLocale = (path: string): string => {
  const [, first, ...rest] = path.split('/')
  if (!locales.includes(first) || first === defaultLocale) return path
  // "/de" is the German home page, so it normalises to "/" rather than the empty string.
  return `/${rest.join('/')}`
}

const localize = (path: string): string[] =>
  locales.map((locale) => {
    if (locale === defaultLocale) return path
    // The root needs special-casing: naive concatenation gives "/de/", which 308s to "/de", and
    // res.revalidate() on a redirect throws — failing the whole Promise.all below, including the
    // paths that were fine. Reachable via stripLocale, which normalises "/de" to "/".
    return path === '/' ? `/${locale}` : `/${locale}${path}`
  })

const Route = async (req: NextApiRequest, res: NextApiResponse) => {
  const secret = process.env.REVALIDATION_KEY
  if (!secret) {
    return res.status(500).json({ message: 'REVALIDATION_KEY is not configured on the server.' })
  }

  const providedKey = req.query.key || req.headers['x-revalidation-key']
  if (providedKey !== secret) {
    return res.status(401).json({ message: 'Invalid revalidation key.' })
  }

  // Collect requested paths from `path` and/or `paths` (query or body).
  const source = { ...req.query, ...(typeof req.body === 'object' ? req.body : {}) }
  let paths: string[] = []
  if (source.path) paths.push(...[].concat(source.path))
  if (source.paths) {
    paths.push(...(Array.isArray(source.paths) ? source.paths : String(source.paths).split(',')))
  }

  paths = paths.map((p) => p.trim()).filter(Boolean)
  if (paths.length === 0) {
    return res.status(400).json({ message: 'No path(s) provided. Pass `path` or `paths`.' })
  }

  // Paths must be absolute (start with "/") for res.revalidate().
  const invalid = paths.find((p) => !p.startsWith('/'))
  if (invalid) {
    return res.status(400).json({ message: `Path must start with "/": ${invalid}` })
  }

  const expand = String(source.locales) === 'true'
  // Normalised before expanding, and the Set then collapses the duplicates that produces — being
  // handed all 26 localised variants of one page is the common case, and it should mean one
  // expansion, not 26 nested ones. Without `locales=true` paths are honoured exactly as given.
  const targets = expand ? Array.from(new Set(paths.map(stripLocale).flatMap(localize))) : paths

  try {
    await Promise.all(targets.map((target) => res.revalidate(target)))
    return res.json({ revalidated: true, paths: targets })
  } catch (err) {
    // On failure Next.js keeps serving the last successfully generated page.
    return res.status(500).json({ message: 'Error revalidating.', error: String(err) })
  }
}

export default Route
