import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useUserPatron } from 'contexts/UserPatronContext'

// Gated Bunny Stream player for a single lecture. Requests a signed embed URL
// from /api/videoUrl by (course, lecture) — the server resolves the video id and
// enforces the reward gate. Data-functional placeholder — no styling yet.
const CourseVideo = ({ course, lecture }) => {
  const { user, isLoading, uuid } = useUserPatron()
  const router = useRouter()

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gated, setGated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uuid) return
    setLoading(true)
    setError(null)
    setGated(false)
    fetch('/api/videoUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid, course: course.id, lecture: lecture.slug }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.message || 'Unable to load this video.')
          if (data.error === '403') setGated(true)
        } else {
          setVideoUrl(data.url)
        }
      })
      .catch(() => setError('Unable to load this video.'))
      .finally(() => setLoading(false))
  }, [uuid, course.id, lecture.slug])

  if (isLoading) return <p>Loading…</p>

  if (!user) {
    return (
      <div>
        <p>Please sign in with your Patreon-linked account to watch this lecture.</p>
        <Link href={`/account?returnTo=${encodeURIComponent(router.asPath)}`}>Sign in</Link>
      </div>
    )
  }

  if (loading) return <p>Checking access…</p>

  if (error || !videoUrl) {
    return (
      <div>
        <p>{error || 'Unable to load this video.'}</p>
        {gated && <Link href="/join">See membership options</Link>}
      </div>
    )
  }

  return (
    <iframe
      src={videoUrl}
      title={lecture.name}
      loading="lazy"
      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
    ></iframe>
  )
}

export default CourseVideo
