const CorporateSponsorLogo = ({ id, data }) => {
  return (
    <a href={data.link} rel="noopener">
      <img
        key={id}
        src={`https://cdn.polyhaven.com/corporate_sponsors/${data.logo}`}
        alt={data.name}
        title={data.name}
      />
    </a>
  )
}

export default CorporateSponsorLogo
