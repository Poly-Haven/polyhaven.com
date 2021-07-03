import useSWR from 'swr';
import fetcher from 'utils/fetcher';

export default function apiSWR(url: string, options) {
  const baseUrl = (process.env.NODE_ENV == "production" || process.env.POLYHAVEN_API == "live") ? "https://api.polyhaven.com" : "https://api.polyhaven.com"
  return useSWR(`${baseUrl}${url}`, fetcher, options);
}