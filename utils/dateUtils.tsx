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

export function weightedDownloadsPerDay(download_count, epoch) {
  return download_count / Math.pow(Math.abs(Date.now() - epoch * 1000) + 1, 1.7)
}