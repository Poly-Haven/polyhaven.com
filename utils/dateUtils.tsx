export function daysOld(epoch) {
  return (Date.now() - epoch * 1000) / 1000 / 60 / 60 / 24;
}

export function weightedDownloadsPerDay(download_count, epoch) {
  return download_count / Math.pow(Math.abs(Date.now() - epoch * 1000) + 1, 1.7)
}