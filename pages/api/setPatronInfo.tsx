import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import crypto from 'crypto'
require('dotenv').config()

const USER_EDITABLE_FIELDS = ['anon', 'display_name', 'auto_sponsor', 'notify_email', 'url']

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
  // This route forwards a browser's body, so only pass on what the account page lets people edit.
  // invite_sent and sponsor_tokens are written by nextcloudInvite and sponsorAsset, which check first.
  data = Object.fromEntries(Object.entries(data).filter(([k]) => USER_EDITABLE_FIELDS.includes(k)))
  data.uuid = user.sub.split('|').pop()
  data.key = crypto.createHmac('sha256', process.env.PATRON_INFO_KEY).update(data.uuid).digest('hex')

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  let returnData = {
    error: '500',
    message: 'Unknown error',
  }
  await fetch(`${baseUrl}/patron_info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((resdata) => {
      returnData = resdata
    })

  res.status(200).json(returnData)
}

export default withApiAuthRequired(Route)
