const Route = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }

  let headers = req.headers
  // Remove all but needed headers
  const rtn = ['accept-language']
  for (const key in headers) {
    if (!rtn.includes(key)) {
      delete headers[key]
    }
  }

  res.status(200).json(headers)
}

export default Route
