import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import crypto from 'crypto'
require('dotenv').config()

import patreon_tiers from 'constants/patreon_tiers.json'

// The Patreon reward a member must hold to watch course videos.
// TODO: switch this to the dedicated courses reward once that tier is created.
const REQUIRED_REWARD = 'Offline Access'

// Bunny Stream video library that hosts the course videos (not secret — it's in
// the public embed URL). The signing key lives in BUNNY_TOKEN_AUTH_KEY.
const BUNNY_LIBRARY_ID = '689507'

// The single course video we serve while verifying the player. We deliberately
// do NOT accept a client-supplied videoId: signing an arbitrary id would let any
// qualifying patron mint a token for any video in the library. When the courses
// platform grows, replace this with a server-side lessonId -> { videoId, reward }
// map and gate per video.
const COURSE_VIDEO_ID = '8b2ce2eb-b898-4110-93fd-f8f0fdfb76e5'

// How long a signed embed URL stays valid, in seconds.
const TOKEN_TTL_SECONDS = 60 * 60 * 4 // 4 hours

const Route = async (req, res) => {
  let data = req.body
  const session = await getSession(req, res)
  const user = session?.user
  if (data.uuid !== user.sub.split('|').pop()) {
    res.status(403).json({
      error: '403',
      message: 'UIDs do not match.',
    })
    return
  }

  if (!process.env.BUNNY_TOKEN_AUTH_KEY) {
    console.error('BUNNY_TOKEN_AUTH_KEY is not configured')
    res.status(500).json({
      error: '500',
      message: 'Video provider is not configured.',
    })
    return
  }

  // Look up the patron's rewards — same flow as /api/patronInfo.
  data.key = crypto.createHmac('sha256', process.env.PATRON_INFO_KEY).update(data.uuid).digest('hex')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  let patron = {
    error: '500',
    message: 'Unknown error',
  }
  await fetch(`${baseUrl}/patron_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uuid: data.uuid, key: data.key }),
  })
    .then((res) => res.json())
    .then((resdata) => {
      patron = resdata
    })

  // Is the pledge currently active? (mirrors /api/patronInfo)
  let patronIsValid = false
  if (patron['status'] === 'active_patron') {
    patronIsValid = true
  } else if (patron['last_charge_status'] === 'Paid') {
    const now = Date.now()
    const lastCharge = Date.parse(patron['last_charge_date'])
    const daysAgo = (now - lastCharge) / 1000 / 60 / 60 / 24
    if (daysAgo <= 31 || (patron['yearly_pledge'] && daysAgo <= 365)) {
      patronIsValid = true
    }
  }

  // Collapse the patron's tiers into a flat set of rewards.
  let rewards = {}
  if (patronIsValid && patron['tiers']) {
    for (const tier of patron['tiers']) {
      if (Object.keys(patreon_tiers).includes(tier)) {
        for (const r of patreon_tiers[tier].rewards) {
          rewards[r] = true
        }
      }
    }
  }

  if (!rewards[REQUIRED_REWARD]) {
    res.status(403).json({
      error: '403',
      message: `This content requires the "${REQUIRED_REWARD}" Patreon reward.`,
    })
    return
  }

  // Sign a time-limited Bunny Stream embed URL.
  // token = SHA256_HEX(token_security_key + video_id + expires)
  // https://docs.bunny.net/docs/stream-embed-token-authentication
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const token = crypto
    .createHash('sha256')
    .update(`${process.env.BUNNY_TOKEN_AUTH_KEY}${COURSE_VIDEO_ID}${expires}`)
    .digest('hex')

  const params = new URLSearchParams({
    token,
    expires: String(expires),
    autoplay: 'false',
    loop: 'false',
    muted: 'false',
    preload: 'true',
    responsive: 'true',
  })
  const url = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${COURSE_VIDEO_ID}?${params.toString()}`

  res.status(200).json({ error: null, url })
}

export default withApiAuthRequired(Route)
