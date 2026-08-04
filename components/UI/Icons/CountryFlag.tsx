import ReactCountryFlag from 'react-country-flag'

const CountryFlag = ({ code }) => {
  // Decorative everywhere it's used - the language name is always rendered beside it, and a flag
  // is a poor label for a language anyway. An empty alt keeps it out of the accessibility tree.
  return <ReactCountryFlag countryCode={code} svg alt="" style={{ width: 'inherit' }} />
}

export default CountryFlag
