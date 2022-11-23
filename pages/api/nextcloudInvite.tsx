import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import crypto from 'crypto'
import parseXML from 'fast-xml-parser'
require('dotenv').config()

const Route = async (req, res) => {
  let data = req.body
  const { user } = getSession(req, res)
  if (data.uuid !== user.sub.split('|').pop()) {
    res.status(403).json({
      error: '403',
      message: 'UIDs do not match.',
    })
    return
  }
  data.key = crypto.createHmac('sha256', process.env.PATRON_INFO_KEY).update(data.uuid).digest('hex')

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  let returnData = {
    error: '500',
    message: 'Unknown error',
  }

  await fetch(`${baseUrl}/patron_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((resdata) => {
      returnData = resdata
    })

  if (returnData.error) {
    res.status(400).json(returnData)
    return
  }

  if (returnData['invite_sent']) {
    res.status(403).json({
      error: 403,
      message: 'You already got an invite',
    })
    return
  }

  returnData = {
    error: '500',
    message: 'Unknown error',
  }
  await fetch(process.env.NEXTCLOUD_INVITE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' + Buffer.from(process.env.NEXTCLOUD_USER + ':' + process.env.NEXTCLOUD_PASS).toString('base64'),
      'OCS-APIRequest': 'true',
    },
    body: `userid=${data.email}&email=${data.email}&quota=1B&groups[]=patrons`,
  })
    .then((res) => res.text())
    .then((resdata) => {
      returnData = parseXML.parse(resdata)
    })

  if (!returnData.error) {
    await fetch(`${baseUrl}/patron_info`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uuid: data.uuid,
        key: data.key,
        invite_sent: true,
      }),
    })
      .then((res) => res.json())
      .then((resdata) => {
        if (res.error) {
          console.error(resdata)
        }
      })
  }

  res.status(200).json(returnData)
}

export default withApiAuthRequired(Route)
