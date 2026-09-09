import { RequestError } from '@auth0/nextjs-auth0/client'
import type { UserProfile } from '@auth0/nextjs-auth0/client'

/**
 * Stops anonymous visitors asking the server whether they are logged in.
 *
 * Both failure directions self-heal, which is why there is no logout hook:
 *   flag but no session (logged out elsewhere, session expired) -> one 204, then the flag is cleared
 *   session but no flag  (signed in before this shipped)        -> probed once per browser, ever
 */

export const HINT_COOKIE = 'ph_auth'
const PROBED_KEY = 'ph_auth_probed'
// Auth0's default absolute session duration, so the flag never expires before the session it describes.
const MAX_AGE = 60 * 60 * 24 * 7

export const hasHint = (): boolean =>
  typeof document !== 'undefined' && document.cookie.split('; ').some((c) => c.startsWith(`${HINT_COOKIE}=`))

const writeHint = (present: boolean) => {
  const age = present ? MAX_AGE : 0
  document.cookie = `${HINT_COOKIE}=${present ? '1' : ''}; Path=/; Max-Age=${age}; SameSite=Lax; Secure`
}

// localStorage throws outright in some privacy modes. Never let bookkeeping break sign-in.
const probed = (): boolean => {
  try {
    return localStorage.getItem(PROBED_KEY) === '1'
  } catch {
    return false
  }
}
const markProbed = () => {
  try {
    localStorage.setItem(PROBED_KEY, '1')
  } catch {
    /* ignore */
  }
}

/** Mirrors the library's own fetcher, including its RequestError contract. */
const request = async (url: string): Promise<UserProfile | undefined> => {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new RequestError(0)
  }
  if (response.status === 204) return undefined
  if (response.ok) return response.json()
  throw new RequestError(response.status)
}

const authFetcher = async (url: string): Promise<UserProfile | undefined> => {
  if (hasHint()) {
    const user = await request(url)
    if (!user) writeHint(false)
    return user
  }
  if (!probed()) {
    // Mark before the request, not after: a failed probe must not retry on every page load.
    markProbed()
    const user = await request(url)
    if (user) writeHint(true)
    return user
  }
  return undefined
}

export default authFetcher
