// Shared by pages/map.tsx (server) and Map.tsx (client). Kept apart from Map.tsx, which imports
// Leaflet and so can't be loaded on the server.

// [slug, lat, lon, name, img_version, date_taken (unix seconds), photographer]
export type MapHdri = [string, number, number, string, string | null, number | null, string | null]

// Library attribute filters the map leaves out: not much use for picking a place, and the sidebar's
// vertical space is precious. Ignored in the URL too, so nothing filters the map invisibly.
export const MAP_HIDDEN_ATTRIBUTES = ['contrast']

// The person to credit on the map: whoever captured it. HDRIs credit either one author with "All"
// or a photographer plus someone else for "Processing" / "Backplates" (role case varies).
export const photographerOf = (authors: Record<string, string> | undefined): string | null => {
  const entries = Object.entries(authors || {})
  return (entries.find(([, role]) => /^(all|photography)$/i.test(role)) || entries[0])?.[0] ?? null
}

// Converts an API asset into the map's compact form.
export const toMapHdri = (slug: string, info: any, round: (n: number) => number = (n) => n): MapHdri => [
  slug,
  round(info.coords[0]),
  round(info.coords[1]),
  // `|| slug`: an undefined value would make Next refuse to serialise the props, failing every
  // regeneration until it's fixed.
  info.name || slug,
  info.img_version || null,
  info.date_taken || null,
  photographerOf(info.authors),
]
