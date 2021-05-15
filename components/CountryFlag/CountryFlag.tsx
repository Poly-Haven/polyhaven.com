const CountryFlag = ({ code }) => {
  switch (code) {
    case 'ZA':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg" />
    case 'NL':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg" />
    case 'DE':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg" />
    case 'UL':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg" />
    default:
      return null;
  }
}

export default CountryFlag
