import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import crypto from 'crypto'
require('dotenv').config()

import patreon_tiers from 'constants/patreon_tiers.json'

// The Patreon reward a member must hold to watch course videos.
// TODO: switch this to the dedicated courses reward once that tier is created.
const REQUIRED_REWARD = 'Offline Access'

// Bunny Stream video library that hosts the course videos.
const BUNNY_LIBRARY_ID = '689507'

// How long a signed embed URL stays valid, in seconds.
const TOKEN_TTL_SECONDS = 60 * 60 * 4 // 4 hours

const ID_PATTERN = /^[a-zA-Z0-9_-]+$/

const Route = async (req, res) => {
  let data = req.body
  const session = await getSession(req, res)
  const user = session?.user
  if (data.uuid !== user.sub.split('|').pop()) {
    res.status(403).json({ error: '403', message: 'UIDs do not match.' })
    return
  }

  if (!process.env.BUNNY_TOKEN_AUTH_KEY) {
    console.error('BUNNY_TOKEN_AUTH_KEY is not configured')
    res.status(500).json({ error: '500', message: 'Video provider is not configured.' })
    return
  }

  // Which lecture is being requested. The client never supplies a raw video id —
  // we resolve it server-side from the course data so this can't sign arbitrary
  // videos in the library.
  const courseId = data.course
  const lectureSlug = data.lecture
  if (!courseId || !lectureSlug || !ID_PATTERN.test(courseId) || !ID_PATTERN.test(lectureSlug)) {
    res.status(400).json({ error: '400', message: 'Invalid course or lecture.' })
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

  // Resolve the lecture's Bunny video id from the course data (the allow-list).
  const course = await fetch(`${baseUrl}/courses/${courseId}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  let videoId = null
  for (const chapter of course?.chapters || []) {
    for (const lecture of chapter.lectures || []) {
      if (lecture.slug === lectureSlug) videoId = lecture.video_id
    }
  }
  if (!videoId) {
    res.status(404).json({ error: '404', message: 'Lecture not found.' })
    return
  }

  // Sign a time-limited Bunny Stream embed URL.
  // token = SHA256_HEX(token_security_key + video_id + expires)
  // https://docs.bunny.net/docs/stream-embed-token-authentication
  const expires = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS
  const token = crypto
    .createHash('sha256')
    .update(`${process.env.BUNNY_TOKEN_AUTH_KEY}${videoId}${expires}`)
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
  const url = `https://iframe.mediadelivery.net/embed/${BUNNY_LIBRARY_ID}/${videoId}?${params.toString()}`

  res.status(200).json({ error: null, url })
}

export default withApiAuthRequired(Route)
