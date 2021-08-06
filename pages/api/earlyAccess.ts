import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import crypto from 'crypto'
import { parse } from 'url'
require('dotenv').config()

const Route = async (req, res) => {
  const uuid = req.query.uuid
  const { user } = getSession(req, res);
  if (uuid !== user.sub.split('|').pop()) {
    res.status(403).json({});
    return
  }
  const eakey = crypto.createHmac('sha256', process.env.EA_KEY).update(uuid).digest('hex')

  let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"
  baseUrl += '/assets?' + parse(req.url).query

  let returnData = {}
  await fetch(`${baseUrl}&eakey=${eakey}`).then(res => res.json())
    .then(resdata => {
      returnData = resdata
    })

  res.status(200).json(returnData);
}

export default withApiAuthRequired(Route);