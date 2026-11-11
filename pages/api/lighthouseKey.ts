import { getSession } from '@auth0/nextjs-auth0'
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

// Proxy for the unlisted Project Lighthouse Steam key page (pages/lighthouse-key.tsx) to api's
// /lighthouse_key, signing the Patreon user ID from the session the same way patronInfo does.
// POST only: the zone force-caches GETs, and never caches a POST.
// Design: info/steam_key_claims_plan.md (Poly Haven root).

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

const forward = async (res: NextApiResponse, path: string, body: object) => {
  const apiRes = await fetch(`${baseUrl}/lighthouse_key${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (apiRes.status === 404) return res.status(404).json({ state: 'not_found' })
  const data = await apiRes.json().catch(() => ({ state: 'error' }))
  return res.status(apiRes.ok ? 200 : apiRes.status).json(data)
}

const Route = async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Cache-Control', 'private, no-store')
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ state: 'error' })
  }
  const action = req.body?.action

  try {
    if (action === 'open') return await forward(res, '/open', {})

    const session = await getSession(req, res)
    const user = session?.user
    if (!user) return res.status(401).json({ state: 'logged_out' })
    const uuid = user.sub.split('|').pop()
    const key = crypto.createHmac('sha256', process.env.PATRON_INFO_KEY).update(uuid).digest('hex')

    if (action === 'status') return await forward(res, '', { uuid, key })
    if (action === 'claim') {
      return await forward(res, '/claim', { uuid, key, email: user.email || null, terms_version: req.body.terms_version })
    }
    return res.status(400).json({ state: 'error' })
  } catch (err) {
    console.error('[lighthouseKey]', err)
    return res.status(503).json({ state: 'error' })
  }
}

export default Route
