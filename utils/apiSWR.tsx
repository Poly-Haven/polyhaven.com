import useSWR from 'swr'
import fetcher from 'utils/fetcher'

export default function apiSWR(url: string | null, options?) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  // SWR treats a null key as "don't fetch yet", and callers rely on that (Download.tsx passes
  // `vault ? '/vaults' : null`). Interpolating it produced the key "https://api.polyhaven.comnull"
  // - a truthy string - so the conditional never actually disabled anything.
  return useSWR(url ? `${baseUrl}${url}` : null, fetcher, options)
}
