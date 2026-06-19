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

const localize = (path: string): string[] =>
  locales.map((locale) => (locale === defaultLocale ? path : `/${locale}${path}`))

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
  const targets = expand ? Array.from(new Set(paths.flatMap(localize))) : paths

  try {
    await Promise.all(targets.map((target) => res.revalidate(target)))
    return res.json({ revalidated: true, paths: targets })
  } catch (err) {
    // On failure Next.js keeps serving the last successfully generated page.
    return res.status(500).json({ message: 'Error revalidating.', error: String(err) })
  }
}

export default Route
