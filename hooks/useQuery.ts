import { useRouter } from 'next/router'

// Resolves query or returns null. Source: https://github.com/vercel/next.js/discussions/12661
export default function useQuery() {
  const router = useRouter()
  const hasQueryParams = /\[.+\]/.test(router.route) || /\?./.test(router.asPath)
  const ready = !hasQueryParams || Object.keys(router.query).length > 0
  if (!ready) return null
  return router.query
}
