import ReactCountryFlag from "react-country-flag"

const CountryFlag = ({ code }) => {
  return <ReactCountryFlag countryCode={code} svg style={{ width: 'inherit' }} />
}

export default CountryFlag
