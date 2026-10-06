require('dotenv').config()

const Route = async (req, res) => {
  // Only the download buttons call this, always as a JSON POST. Crawlers that find the URL in the
  // JS bundle GET it with no body, which Next hands over as '' - and assigning to that threw a 500.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ message: 'Method not allowed' })
    return
  }
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ message: 'Expected a JSON body' })
    return
  }

  let data = req.body
  data.ip = data.uuid
  delete data.uuid
  data.key = process.env.DL_KEY

  let returnData = { message: 'Failed to track.' }
  await fetch(`https://api.polyhaven.com/dl_track`, {
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

  res.status(200).json(returnData)
}

export default Route
