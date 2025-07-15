const ONE_DAY_MS = 24 * 60 * 60 * 1000
const FUTURE_ASSET_BOOST = 10000000
const TODAY_ASSET_BOOST = 10000
const AGE_EXPONENT = 1.7
const SCALE_FACTOR = 1e6

export function daysOld(epoch) {
  return (Date.now() - epoch * 1000) / 1000 / 60 / 60 / 24
}

export function timeago(epoch, t, returnList = false) {
  const segments = {
    year: 3.154e10,
    month: 2.628e9,
    week: 6.048e8,
    day: 8.64e7,
    hour: 3.6e6,
    today: -Infinity,
  }

  let timeDifference = Date.now() - epoch
  const tense = timeDifference > 0 ? 'past' : 'future'
  timeDifference = Math.abs(timeDifference)
  const unit = Object.keys(segments)[Object.values(segments).findIndex((time) => timeDifference >= time)]
  const num = Math.floor(timeDifference / segments[unit])

  const returnStr = unit === 'today' ? t('today') : t(`${tense}.${unit}`, { count: num })
  return returnList ? [num, returnStr] : returnStr
}

export function timeDiff(d1, d2, morePrecise = false) {
  const segments = {
    year: 3.154e10,
    month: 2.628e9,
    week: 6.048e8,
    day: 8.64e7,
    hour: 3.6e6,
    minute: 60000,
    second: 1000,
    millisecond: -Infinity,
  }

  let timeDifference = d1 - d2
  timeDifference = Math.abs(timeDifference)
  let unit = Object.keys(segments)[Object.values(segments).findIndex((time) => timeDifference >= time)]

  if (morePrecise) {
    // One unit lower for more precision, fallback to milliseconds
    unit =
      unit === 'millisecond'
        ? 'millisecond'
        : Object.keys(segments)[Object.values(segments).findIndex((time) => timeDifference >= time) + 1]
  }
  const num = Math.floor(timeDifference / segments[unit])

  return `${num} ${unit}${num === 1 ? '' : 's'}`
}

export function weightedDownloadsPerDay(download_count, epoch, name) {
  const now = Date.now()
  const epochMs = epoch * 1000

  // Ensure download_count is a number
  download_count = download_count || 0

  // Apply boosts for future or today's assets
  if (now < epochMs) {
    download_count += FUTURE_ASSET_BOOST
  } else if (now - epochMs < ONE_DAY_MS) {
    download_count += TODAY_ASSET_BOOST
  }

  // Calculate age in days (minimum 1 day)
  const ageInDays = Math.max(1, (now - epochMs) / ONE_DAY_MS)

  // Calculate weighted value and scale in one operation
  const weightedValue = download_count / Math.pow(ageInDays, AGE_EXPONENT)

  return Math.round(weightedValue * SCALE_FACTOR) / SCALE_FACTOR
}

export function downloadsPerDay(download_count, epoch) {
  const now = Date.now()
  epoch = epoch * 1000
  download_count = download_count || 0 // asset.download_count may be undefined
  return download_count / (now - epoch)
}

export const fixTzOffset = (date: Date) => {
  return new Date(date.valueOf() - date.getTimezoneOffset() * 60 * 1000)
}

export const isoDay = (date: Date) => {
  return date.toISOString().substring(0, 10) // YYYY-MM-DD
}
