import useSWR from 'swr';
import fetcher from 'utils/fetcher';

export default function apiSWR(url: string, options) {
  const baseUrl = process.env.NODE_ENV == "production" ? "https://api.polyhaven.com" : "http://localhost:3000"
  return useSWR(`${baseUrl}${url}`, fetcher, options);
}