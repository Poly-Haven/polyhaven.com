import CountryFlag from "components/UI/Icons/CountryFlag";

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