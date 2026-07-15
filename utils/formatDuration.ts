// Format a number of seconds as m:ss (or h:mm:ss for >= 1 hour).
export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds || 0))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${m}:${String(sec).padStart(2, '0')}`
}

// Format a number of seconds as a rounded summary, e.g. "2h 0m" or "15 min".
// For chapter/course totals, where the exact h:mm:ss of formatDuration() would
// imply a precision we don't mean.
export function formatDurationCoarse(totalSeconds: number): string {
  const totalMinutes = Math.round(Math.max(0, totalSeconds || 0) / 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m} min`
}
