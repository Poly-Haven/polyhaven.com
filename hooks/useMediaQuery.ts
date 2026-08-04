import { useEffect, useState } from 'react'

// Keep in sync with $mobileBreakpoint in components/Layout/Header/Nav/Nav.module.scss
export const MOBILE_QUERY = '(max-width: 890px)'

/**
 * Tracks a CSS media query from JS. Returns false during SSR and on the first
 * client render, so anything gated on it must degrade gracefully.
 */
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)

    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export default useMediaQuery
