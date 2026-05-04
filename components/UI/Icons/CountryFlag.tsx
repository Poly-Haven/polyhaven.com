import ReactCountryFlag from 'react-country-flag'

const CountryFlag = ({ code }) => {
  return <ReactCountryFlag countryCode={code} svg style={{ width: 'inherit' }} title={code} alt={code} />
}

export default CountryFlag
