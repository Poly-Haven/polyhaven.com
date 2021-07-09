import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
import crypto from 'crypto'
require('dotenv').config()

import patreon_tiers from 'constants/patreon_tiers.json'

const Route = async (req, res) => {
  let data = req.body;
  const { user } = getSession(req, res);
  if (data.uuid !== user.sub.split('|').pop()) {
    res.status(403).json({
      error: "403",
      message: "UIDs do not match."
    });
    return
  }
  data.key = crypto.createHmac('md5', process.env.PATRON_INFO_KEY).update(data.uuid).digest('hex')

  const baseUrl = (process.env.NODE_ENV == "production" || process.env.POLYHAVEN_API == "live") ? "https://api.polyhaven.com" : "http://localhost:3000"

  let returnData = {
    error: "500",
    message: "Unknown error"
  }
  await fetch(`${baseUrl}/patron_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then(res => res.json())
    .then(resdata => {
      returnData = resdata
    })

  let rewards = {}
  if (returnData['tiers']) {
    for (const tier of returnData['tiers']) {
      if (Object.keys(patreon_tiers).includes(tier)) {
        for (const r of patreon_tiers[tier].rewards) {
          rewards[r] = true
        }
      }
    }
  }
  if (returnData['status'] === 'active_patron') {
    rewards['Other'] = true
  }
  returnData['rewards'] = Object.keys(rewards)

  res.status(200).json(returnData);
}

export default withApiAuthRequired(Route);