import useSWR from 'swr'
import fetcher from 'utils/fetcher'

export default function apiSWR(url: string, options) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  return useSWR(`${baseUrl}${url}`, fetcher, options)
}
