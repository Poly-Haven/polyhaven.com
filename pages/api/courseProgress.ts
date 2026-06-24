import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import crypto from 'crypto'
require('dotenv').config()

// Reads (POST) and writes (PATCH) the caller's course progress. Validates the
// Auth0 session, then proxies to the api with the shared HMAC key — same pattern
// as patronInfo.tsx / setPatronInfo.tsx.
const Route = async (req, res) => {
  const data = req.body
  const session = await getSession(req, res)
  const user = session?.user
  if (data.uuid !== user.sub.split('|').pop()) {
    res.status(403).json({ error: '403', message: 'UIDs do not match.' })
    return
  }
  data.key = crypto.createHmac('sha256', process.env.PATRON_INFO_KEY).update(data.uuid).digest('hex')

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const method = req.method === 'PATCH' ? 'PATCH' : 'POST'

  let returnData = {
    error: '500',
    message: 'Unknown error',
  }
  await fetch(`${baseUrl}/course_progress`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((r) => r.json())
    .then((d) => {
      returnData = d
    })
    .catch(() => {})

  res.status(200).json(returnData)
}

export default withApiAuthRequired(Route)
