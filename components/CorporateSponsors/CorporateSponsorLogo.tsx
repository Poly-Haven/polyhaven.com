import { useSiteImg } from 'contexts/ImageVersionsContext'
const CorporateSponsorLogo = ({ id, data, className }) => {
  const siteImg = useSiteImg()
  return (
    <a href={data.link} rel="noopener" className={className}>
      <img
        key={id}
        src={siteImg(`corporate_sponsors/${data.logo}`)}
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
