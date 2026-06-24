import { useState, useEffect, useCallback, useRef } from 'react'

import { useUserPatron } from 'contexts/UserPatronContext'
import { getLocalCompleted, addLocalCompleted } from 'utils/courseProgressLocal'

// --- thin client wrappers (mirror utils/patronInfo.tsx) ---
// The Next API route adds the HMAC key + validates the session; the client only
// ever sends { uuid, ...payload }.

export async function getCourseProgress(uuid) {
  let returnData = null
  await fetch(`/api/courseProgress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uuid }),
  })
    .then((res) => res.json())
    .then((resdata) => {
      returnData = resdata
    })
    .catch(() => {})
  return returnData
}

export async function setCourseProgress(uuid, data) {
  let returnData = null
  await fetch(`/api/courseProgress`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, uuid }),
  })
    .then((res) => res.json())
    .then((resdata) => {
      returnData = resdata
    })
    .catch(() => {})
  return returnData
}

// --- hook: merges localStorage (instant) with the light server summary ---
export function useCourseProgress(courseId) {
  const { uuid } = useUserPatron()
  const [completed, setCompleted] = useState<Set<string>>(() => new Set())
  const [lastLecture, setLastLecture] = useState<string | null>(null)
  const sentLast = useRef<string | null>(null)

  // Seed instantly from localStorage.
  useEffect(() => {
    setCompleted(new Set(getLocalCompleted()))
  }, [])

  // Merge the server summary once signed in.
  useEffect(() => {
    if (!uuid) return
    let cancelled = false
    getCourseProgress(uuid).then((data) => {
      if (cancelled || !data || data.error) return
      if (Array.isArray(data.completed)) {
        setCompleted((prev) => new Set(Array.from(prev).concat(data.completed)))
      }
      if (data.lastLecture) setLastLecture(data.lastLecture)
    })
    return () => {
      cancelled = true
    }
  }, [uuid])

  const markCompleted = useCallback(
    (slug) => {
      addLocalCompleted(slug)
      setCompleted((prev) => {
        if (prev.has(slug)) return prev
        const next = new Set(prev)
        next.add(slug)
        return next
      })
      // arrayUnion is idempotent server-side, so a repeat is harmless.
      if (uuid) setCourseProgress(uuid, { completed: [slug] })
    },
    [uuid]
  )

  const recordLastLecture = useCallback(
    (slug) => {
      if (sentLast.current === slug) return
      sentLast.current = slug
      setLastLecture(slug)
      if (uuid) setCourseProgress(uuid, { lastLecture: slug })
    },
    [uuid]
  )

  const isCompleted = useCallback((slug) => completed.has(slug), [completed])

  return { completed, isCompleted, markCompleted, recordLastLecture, lastLecture }
}
