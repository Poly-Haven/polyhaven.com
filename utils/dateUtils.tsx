import epochTimeago from 'epoch-timeago';

export function daysOld(epoch) {
  return (Date.now() - epoch * 1000) / 1000 / 60 / 60 / 24;
}

export function timeago(epoch) {
  const now = Date.now()
  const twelveHours = (12 * 60 * 60 * 1000)
  if (now - twelveHours < epoch && epoch < now + twelveHours) {
    return "Today"
  }
  if (now < epoch) {
    return epochTimeago(now - (epoch - now)).replace(" ago", " from now")
  }
  return epochTimeago(epoch)
}

export function weightedDownloadsPerDay(download_count, epoch, name) {
  const oneDay = (24 * 60 * 60 * 1000)
  const now = Date.now()
  epoch = epoch * 1000
  if (now - oneDay < epoch) {
    // Force assets from today to rank very high
    download_count = download_count || 0 // asset.download_count may be undefined
    download_count += 10000000
  }
  return download_count / Math.pow(Math.abs(now - epoch) + 1, 1.7)
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