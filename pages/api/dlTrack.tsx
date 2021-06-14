require('dotenv').config()

const Route = async (req, res) => {
  let data = req.body;
  data.ip = data.uuid
  delete data.uuid
  data.key = process.env.DL_KEY

  await fetch(`https://api.polyhaven.com/dl_track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  res.status(200).json(data);
}

export default Route;