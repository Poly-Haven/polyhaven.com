import type { NextApiRequest, NextApiResponse } from 'next'
import { i18n } from '../../next-i18next.config'

/**
 * The set of locales this site actually serves.
 *
 * Exists so other services don't have to keep their own copy. admin needs it to build Cloudflare
 * purge URLs: the zone is on the Pro plan, which can only purge by exact URL, so every localised
 * variant of an asset page has to be named individually — and a locale missing from that list is a
 * locale whose pages never get purged. Hard-coding it in admin meant adding a language here would
 * silently leave the new one stale forever.
 *
 * Read from next-i18next.config, the same source that drives the URL prefixes and that
 * /api/revalidate uses to expand paths, so this can't disagree with what the site really serves.
 *
 * Public on purpose: it's the same information every page already publishes in its hreflang tags,
 * so there's nothing to protect and no key to manage.
 */
const Route = (req: NextApiRequest, res: NextApiResponse) => {
  // Only changes on deploy, so let the edge keep it for a day and serve it stale for a week
  // rather than waking a function for what is effectively a constant.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800')
  res.status(200).json({
    defaultLocale: i18n.defaultLocale,
    locales: i18n.locales,
    // The default is served unprefixed, so this is the set that actually appears in a URL path.
    // Spelled out rather than left to the caller to derive, since getting it wrong is the whole
    // failure mode this endpoint exists to prevent.
    prefixed: i18n.locales.filter((locale: string) => locale !== i18n.defaultLocale),
  })
}

export default Route
