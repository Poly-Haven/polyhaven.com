import CountryFlag from "../../../CountryFlag/CountryFlag";

const LocaleFlag = ({ locale, flag, name }) => {
  return (<>
    <CountryFlag code={flag} />
    {name ? name : null}
  </>)
}

LocaleFlag.defaultProps = {
  name: null,
}

export default LocaleFlag