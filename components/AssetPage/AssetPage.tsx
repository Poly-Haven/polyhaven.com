const AssetPage = ({ assetID, data }) => {
  return (
    <div>
      <h1>{data.name}</h1>
      <p>by {Object.keys(data.authors).join(',')}</p>
    </div>
  )
}

export default AssetPage
