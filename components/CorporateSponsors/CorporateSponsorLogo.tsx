const CorporateSponsorLogo = ({ id, data, className }) => {
  return (
    <a href={data.link} rel="noopener" className={className}>
      <img
        key={id}
        src={`https://cdn.polyhaven.com/corporate_sponsors/${data.logo}`}
        alt={data.name}
        title={data.name}
        className={className}
      />
    </a>
  )
}

CorporateSponsorLogo.defaultProps = {
  className: null,
}

export default CorporateSponsorLogo
