const CountryFlag = ({ code }) => {
  switch (code) {
    case 'ZA':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg" title="South Africa" />
    case 'NL':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/2/20/Flag_of_the_Netherlands.svg" title="Netherlands" />
    case 'DE':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg" title="Germany" />
    case 'UL':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Ukraine.svg" title="Ukraine" />
    case 'US':
      return <img src="https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg" title="United States of America" />
    case 'EU':
      return <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Flag_of_Europe.svg" title="Europe" />
    default:
      return null;
  }
}

export default CountryFlag
