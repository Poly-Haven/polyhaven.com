export function titleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export function stringValue(str) {
  let sum = 0
  let i = str.length
  while (i--) {
    sum += str.charCodeAt(i)
  }
  return sum
}

export function ordinalSuffix(number) {
  const lastDigit = number % 10
  const lastTwoDigits = number % 100

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return number + 'st'
  }
  if (lastDigit === 2 && lastTwoDigits !== 12) {
    return number + 'nd'
  }
  if (lastDigit === 3 && lastTwoDigits !== 13) {
    return number + 'rd'
  }
  return number + 'th'
}

export function urlBaseName(str) {
  return str.split('/').pop()
}

export function removeExtension(str) {
  return str.split('.').slice(0, -1).join('.')
}

export function stringHash(str) {
  let hash = 0
  for (let i = 0, len = str.length; i < len; i++) {
    let chr = str.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export function formatNumber(num) {
  if (num < 1000) {
    return num.toString()
  }
  if (num < 1000000) {
    return Math.round(num / 1000) + 'K'
  }
  if (num < 1000000000) {
    return Math.round(num / 1000000) + 'M'
  }
  if (num < 1000000000000) {
    return Math.round(num / 1000000000) + 'B'
  }
  return Math.round(num / 1000000000000) + 'T'
}
