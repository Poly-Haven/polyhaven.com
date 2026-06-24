import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import { useUserPatron } from 'contexts/UserPatronContext'
import Button from 'components/UI/Button/Button'
import styles from './Courses.module.scss'

const CoursesLanding = () => {
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
      body: JSON.stringify({ uuid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.message || 'Unable to load this video.')
          // 403 means signed in but lacking the required reward.
          if (data.error === '403') setGated(true)
        } else {
          setVideoUrl(data.url)
        }
      })
      .catch(() => setError('Unable to load this video.'))
      .finally(() => setLoading(false))
  }, [uuid])

  // Auth state still resolving.
  if (isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>Loading…</div>
      </div>
    )
  }

  // Not signed in.
  if (!user) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>
          <p>Please sign in with your Patreon-linked account to watch this video.</p>
          <Button text="Sign in" href={`/account?returnTo=${encodeURIComponent(router.asPath)}`} />
        </div>
      </div>
    )
  }

  // Signed in — fetching the signed URL / checking access.
  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>Checking access…</div>
      </div>
    )
  }

  // Signed in but not entitled (or the request failed).
  if (error || !videoUrl) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.message}>
          <p>{error || 'Unable to load this video.'}</p>
          {gated && <Button text="See membership options" href="/join" />}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.iframeContainer}>
        <iframe
          src={videoUrl}
          title="Course video"
          loading="lazy"
          className={styles.iframe}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
        ></iframe>
      </div>
    </div>
  )
}

export default CoursesLanding
