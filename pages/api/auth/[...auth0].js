import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'

import { HINT_COOKIE } from 'utils/authHint'

// A readable companion to the httpOnly session cookie, so the client can tell whether asking
// /api/auth/me is worth a request at all.

const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

const afterCallback = (req, res, session) => {
  // Append: handleCallback has already set the session cookie on this response.
  const existing = res.getHeader('Set-Cookie')
  const cookies = !existing ? [] : Array.isArray(existing) ? existing : [String(existing)]
  res.setHeader('Set-Cookie', [...cookies, `${HINT_COOKIE}=1; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax; Secure`])
  return session
}

export default handleAuth({ callback: handleCallback({ afterCallback }) })
