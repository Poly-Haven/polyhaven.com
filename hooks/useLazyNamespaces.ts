import { useEffect, useState } from 'react'
import { useTranslation } from 'next-i18next'

// One request per file, shared between callers and across a close-and-reopen while it's in flight.
const inFlight = new Map<string, Promise<any>>()

// public/ files are cached for hours (Cloudflare and browsers), and a deploy doesn't purge them; the
// build id makes each deploy's files a new URL, so new or changed strings aren't stuck behind it.
const fetchBundle = (lng: string, ns: string) => {
  const buildId = (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.buildId) || ''
  const url = `/locales/${lng}/${ns}.json?v=${encodeURIComponent(buildId)}`
  if (!inFlight.has(url)) {
    inFlight.set(
      url,
      fetch(url)
        .then((res) => (res.ok ? res.json() : {}))
        .catch(() => ({}))
        .finally(() => inFlight.delete(url))
    )
  }
  return inFlight.get(url)
}

/**
 * Loads i18n namespaces a page didn't ship in its props, the first time `enabled` is true.
 *
 * For UI that most visits never open: the HDRI map's sidebar needs `categories` (~46KB per locale)
 * and `library`, which would otherwise be serialised into every map page's __NEXT_DATA__. They are
 * fetched from public/locales (the same files serverSideTranslations reads) and added to the live
 * i18n instance, for the page's language and the English fallback.
 *
 * Returns true once they're available. Checked against the store on every render rather than kept
 * as a flag, so a fresh i18n instance (e.g. after a client-side locale change) loads them again.
 */
export const useLazyNamespaces = (namespaces: string[], enabled: boolean): boolean => {
  const { i18n } = useTranslation()
  const [, setLoaded] = useState(0)
  const languages = Array.from(new Set([i18n.language, 'en']))
  const missing = languages.flatMap((lng) =>
    namespaces.filter((ns) => !i18n.hasResourceBundle(lng, ns)).map((ns) => [lng, ns])
  )
  const key = missing.map((m) => m.join('/')).join(',')

  useEffect(() => {
    if (!enabled || !missing.length) return
    let cancelled = false
    Promise.all(
      missing.map(([lng, ns]) => fetchBundle(lng, ns).then((json) => i18n.addResourceBundle(lng, ns, json, true, true)))
    ).then(() => {
      if (!cancelled) setLoaded((n) => n + 1)
    })
    return () => {
      cancelled = true
    }
    // `key` stands for `missing`, which is a new array every render.
  }, [enabled, key, i18n])

  return !missing.length
}
