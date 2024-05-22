require('dotenv').config()

const Route = async (req, res) => {
  let data = req.body
  data.key = process.env.DL_KEY

  let returnData = { message: 'Failed to track.' }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  await fetch(`${baseUrl}/gallery_click`, {
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
