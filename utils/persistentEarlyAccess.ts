export function persistentEarlyAccess() {
  // earlyAccessValidity (epoch) is within the last month, but not newer than tomorrow

  if (typeof window === 'undefined') return false // Don't run this on the server
  if (!localStorage) return false // Don't run this if localStorage is not available (e.g. in SSR)

  const msPerDay = 1000 * 60 * 60 * 24
  const earlyAccessValidity = JSON.parse(localStorage.getItem('ea_validity'))
  return (
    earlyAccessValidity &&
    earlyAccessValidity > Date.now() - msPerDay * 30 &&
    earlyAccessValidity < Date.now() + msPerDay
  )
}
