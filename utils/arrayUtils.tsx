export function randomArraySelection(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function sortDictByValue(obj, value, dir = 'ASC') {
  const sDir = {
    DESC: 1,
    ASC: -1
  }
  return Object.keys(obj).sort(function (a, b) {
    return (obj[b][value] - obj[a][value]);
  })
}