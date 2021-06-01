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

export function sortRes(arr: string[]) {
  let dict = {}
  for (const r of arr) {
    let pixels = parseInt(r)
    if (r.endsWith('k')) {
      pixels = pixels * 1024;
    }
    dict[r] = pixels
  }
  return Object.keys(dict).sort(function (a, b) {
    return (dict[a] - dict[b]);
  })
}

export function sortCaseInsensitive(arr: string[]) {
  return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}