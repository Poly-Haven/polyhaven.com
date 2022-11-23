export function randomArraySelection(array) {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function sortObjByValue(obj) {
  const sortedKeys = Object.keys(obj).sort(function (a, b) {
    return obj[b] - obj[a]
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
      pixels = pixels * 1024
    }
    dict[r] = pixels
  }
  return Object.keys(dict).sort(function (a, b) {
    return dict[a] - dict[b]
  })
}

export function sortCaseInsensitive(arr: string[]) {
  return arr.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

export function sortByPreference(arr: string[], preference, prefixes = []) {
  return arr.sort((a, b) => {
    let prefA = preference[a]
    let prefB = preference[b]
    for (const swp of prefixes) {
      if (!prefA && a.startsWith(swp)) {
        prefA = preference[swp]
      }
      if (!prefB && b.startsWith(swp)) {
        prefB = preference[swp]
      }
    }
    prefA = prefA || preference['ANYTHING ELSE']
    prefB = prefB || preference['ANYTHING ELSE']
    let result = 0
    if (prefA !== prefB) {
      result = prefA < prefB ? -1 : 1
    }
    return result
  })
}

export function sliceIntoChunks(arr, chunkSize) {
  const res = []
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize)
    res.push(chunk)
  }
  return res
}
