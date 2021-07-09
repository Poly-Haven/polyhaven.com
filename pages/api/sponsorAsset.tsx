import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import crypto from 'crypto'
require('dotenv').config()

const Route = async (req, res) => {
  const assetID = req.body.assetID

  let data = req.body;
  data.key = crypto.createHmac('md5', process.env.PATRON_INFO_KEY).update(data.uuid).digest('hex')

  const baseUrl = (process.env.NODE_ENV == "production" || process.env.POLYHAVEN_API == "live") ? "https://api.polyhaven.com" : "http://localhost:3000"

  let patron = {
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
      patron = resdata
    })

  if (patron.error) {
    console.error(patron)
    res.status(400).json(patron);
    return
  }

  if (!patron['sponsor_tokens']) {
    res.status(400).json({
      error: "403",
      message: "No sponsor tokens"
    });
    return
  }

  let chosenToken = null
  for (const [t, v] of Object.entries(patron['sponsor_tokens'])) {
    if (!v) {  // Unspent tokens are Falsy
      chosenToken = t
    } else {
      if (v === assetID) {
        res.status(400).json({
          error: "400",
          message: "You're already sponsoring this asset! Please wait a few hours for this page to update."
        });
        return
      }
    }
  }
  if (!chosenToken) {
    res.status(400).json({
      error: "403",
      message: "No remaining sponsor tokens"
    });
    return
  }

  // Add Sponsor to asset
  let returnData = {
    error: "500",
    message: "Unknown error"
  }
  await fetch(`${baseUrl}/sponsor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uuid: data.uuid, assetID: assetID, key: data.key }),
  }).then(res => res.json())
    .then(resdata => {
      returnData = resdata
    })

  if (returnData.error) {
    res.status(200).json(returnData);
    return
  }


  // Update patron Token
  let setData = { sponsor_tokens: {} }
  setData.sponsor_tokens[chosenToken] = assetID
  returnData = {
    error: "500",
    message: "Unknown error"
  }
  await fetch(`${baseUrl}/patron_info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...setData, uuid: data.uuid, key: data.key }),
  }).then(res => res.json())
    .then(resdata => {
      returnData = resdata
    })

  if (!returnData.error) {
    returnData = { error: null, message: "Done! This page may take a few hours to update." }
  }

  res.status(200).json(returnData);
}

export default withApiAuthRequired(Route);