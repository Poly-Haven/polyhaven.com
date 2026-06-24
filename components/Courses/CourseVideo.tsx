import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { useUserPatron } from 'contexts/UserPatronContext'
import { loadPlayerJs } from 'utils/playerjs'
import { getSavedPosition, savePosition } from 'utils/courseProgressLocal'
import styles from './Courses.module.scss'

// Fraction of the video that counts as "watched".
const COMPLETE_THRESHOLD = 0.9

// Gated Bunny Stream player for a single lecture. Requests a signed embed URL from
// /api/videoUrl by (course, lecture); the server resolves the video id + enforces
// the reward gate. Wires Player.js for progress: resume position, save position to
// localStorage, and report completion / first-play to the parent.
const CourseVideo = ({ course, lecture, onComplete, onPlay }) => {
  const { user, isLoading, uuid } = useUserPatron()
  const router = useRouter()

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gated, setGated] = useState(false)
  const [loading, setLoading] = useState(true)

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const onCompleteRef = useRef(onComplete)
  const onPlayRef = useRef(onPlay)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    onPlayRef.current = onPlay
  }, [onPlay])

  // Fetch the signed URL for this lecture.
  useEffect(() => {
    if (!uuid) return
    setLoading(true)
    setError(null)
    setGated(false)
    setVideoUrl(null)
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

  // Wire Player.js once the iframe is mounted.
  useEffect(() => {
    if (!videoUrl || !iframeRef.current) return
    const videoId = lecture.video_id
    let player: any = null
    let cancelled = false
    let counted = false
    let lastSaved = -10

    loadPlayerJs()
      .then((pjs) => {
        if (cancelled || !pjs || !iframeRef.current) return
        player = new pjs.Player(iframeRef.current)
        player.on('ready', () => {
          // Resume from the saved position (unless we're at/near the end).
          const saved = getSavedPosition(videoId)
          if (saved && saved > 5) {
            player.getDuration((dur: number) => {
              if (!dur || saved < dur - 15) player.setCurrentTime(saved)
            })
          }
          player.on('timeupdate', ({ seconds, duration }: { seconds: number; duration: number }) => {
            if (duration && seconds / duration >= COMPLETE_THRESHOLD && !counted) {
              counted = true
              onCompleteRef.current && onCompleteRef.current()
            }
            // Throttle position saves to ~every 5s (or on a backward seek).
            if (seconds - lastSaved >= 5 || seconds < lastSaved) {
              lastSaved = seconds
              savePosition(videoId, seconds, duration)
            }
          })
          player.on('ended', () => {
            if (!counted) {
              counted = true
              onCompleteRef.current && onCompleteRef.current()
            }
          })
          player.on('play', () => {
            onPlayRef.current && onPlayRef.current()
          })
          player.on('pause', () => {
            player.getCurrentTime((s: number) => savePosition(videoId, s, 0))
          })
        })
      })
      .catch(() => {})

    return () => {
      cancelled = true
      try {
        if (player && player.off) {
          player.off('timeupdate')
          player.off('ended')
          player.off('play')
          player.off('pause')
        }
      } catch (e) {
        /* ignore */
      }
    }
  }, [videoUrl, lecture.video_id])

  let inner
  if (isLoading) {
    inner = (
      <div className={styles.playerMessage}>
        <p>Loading…</p>
      </div>
    )
  } else if (!user) {
    inner = (
      <div className={styles.playerMessage}>
        <p>Please sign in with your Patreon-linked account to watch this lecture.</p>
        <Link href={`/account?returnTo=${encodeURIComponent(router.asPath)}`} className={styles.messageLink}>
          Sign in
        </Link>
      </div>
    )
  } else if (loading) {
    inner = (
      <div className={styles.playerMessage}>
        <p>Checking access…</p>
      </div>
    )
  } else if (error || !videoUrl) {
    inner = (
      <div className={styles.playerMessage}>
        <p>{error || 'Unable to load this video.'}</p>
        {gated && (
          <Link href="/join" className={styles.messageLink}>
            See membership options
          </Link>
        )}
      </div>
    )
  } else {
    inner = (
      <iframe
        ref={iframeRef}
        src={videoUrl}
        title={lecture.name}
        loading="lazy"
        allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
      ></iframe>
    )
  }

  return <div className={styles.player}>{inner}</div>
}

export default CourseVideo
