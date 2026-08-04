// In-memory cache of pre-fetched signed video URLs, surviving client-side route
// changes (module persists across Next navigations; cleared on full reload).
// Used to make the next lecture load near-instantly.

const cache = new Map<string, { url: string; at: number }>()

export function setPrefetched(key: string, url: string): void {
  cache.set(key, { url, at: Date.now() })
}

// Returns the cached URL if present and younger than maxAgeMs, else null.
export function getPrefetched(key: string, maxAgeMs: number): string | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.at > maxAgeMs) {
    cache.delete(key)
    return null
  }
  return entry.url
}
