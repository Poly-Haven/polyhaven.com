export function randomArraySelection(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function sortObjByValue(obj) {
  const sortedKeys = Object.keys(obj).sort(function (a, b) {
    return (obj[b] - obj[a]);
  })
  let tempObj = {}
  for (const k of sortedKeys) {
    tempObj[k] = obj[k]
  }
  return tempObj
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