const fetcher = async (url) => {
  const res = await fetch(url)
  const data = await res.json()
  return data
}

export default fetcher
