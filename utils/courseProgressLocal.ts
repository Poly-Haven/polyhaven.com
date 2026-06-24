// Browser-local (fine-grained) course progress. The server only stores the light
// summary (completed lectures + last lecture); per-video playback position lives
// here, keyed by the Bunny video id (globally unique, so multi-course safe).

const POS_PREFIX = 'phcourse:pos:'
const DONE_KEY = 'phcourse:completed'

export function getSavedPosition(videoId: string): number | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(POS_PREFIX + videoId)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return typeof parsed.seconds === 'number' ? parsed.seconds : null
  } catch {
    return null
  }
}

export function savePosition(videoId: string, seconds: number, duration: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(POS_PREFIX + videoId, JSON.stringify({ seconds, duration, updatedAt: Date.now() }))
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

// A local mirror of completed lecture slugs, so checkmarks show instantly before
// the server round-trip resolves (and offline).
export function getLocalCompleted(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || '[]')
  } catch {
    return []
  }
}

export function addLocalCompleted(slug: string): void {
  if (typeof window === 'undefined') return
  try {
    const set = new Set(getLocalCompleted())
    set.add(slug)
    localStorage.setItem(DONE_KEY, JSON.stringify(Array.from(set)))
  } catch {
    /* non-fatal */
  }
}
