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
