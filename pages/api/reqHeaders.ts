const Route = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' })
    return
  }
  res.status(200).json(req.headers)
}

export default Route
