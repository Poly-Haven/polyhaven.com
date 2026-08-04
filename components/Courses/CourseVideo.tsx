import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { MdPlayArrow, MdClose } from 'react-icons/md'

import { useUserPatron } from 'contexts/UserPatronContext'
import { loadPlayerJs } from 'utils/playerjs'
import { getSavedPosition, savePosition } from 'utils/courseProgressLocal'
import { getPrefetched, setPrefetched } from 'utils/videoUrlCache'
import Spinner from 'components/UI/Spinner/Spinner'
import styles from './Courses.module.scss'

const COMPLETE_THRESHOLD = 0.9
// Checkout for the $7 Course Access tier (rid = its id in constants/patreon_tiers.json).
const PATREON_JOIN_URL = 'https://www.patreon.com/checkout/polyhaven?rid=29202719&cadence=12'
const THUMB_CDN = 'https://cdn.polyhaven.com/site_images/courses'
const AUTOPLAY_DELAY = 3000
// Signed URLs last ~4h; reuse a prefetched one only if comfortably fresh.
const PREFETCH_MAX_AGE = 3 * 60 * 60 * 1000
const PLAY_INTENT_KEY = 'phcourse:playnext'

const keyOf = (courseId, slug) => `${courseId}/${slug}`

async function fetchVideoUrl(uuid, courseId, lectureSlug) {
  try {
    const res = await fetch('/api/videoUrl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uuid, course: courseId, lecture: lectureSlug }),
    })
    const data = await res.json()
    if (data.error) return { error: data }
    return { url: data.url }
  } catch {
    return { error: { message: 'Unable to load this video.' } }
  }
}

const CourseVideo = ({ course, lecture, nextLecture, autoplay, onComplete, onPlay }) => {
  const { user, isLoading, uuid } = useUserPatron()
  const router = useRouter()

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [gated, setGated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [ended, setEnded] = useState(false)
  const [advancing, setAdvancing] = useState(false) // leaving for the next lecture
  const [starting, setStarting] = useState(false) // arrived via auto-advance, awaiting play
  const [dismissed, setDismissed] = useState(false) // user closed the "Next up" box

  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const onCompleteRef = useRef(onComplete)
  const onPlayRef = useRef(onPlay)
  const nextRef = useRef(nextLecture)
  const prefetchedRef = useRef(false)
  const shouldPlayRef = useRef(false)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  useEffect(() => {
    onPlayRef.current = onPlay
  }, [onPlay])
  useEffect(() => {
    nextRef.current = nextLecture
  }, [nextLecture])

  const thumbUrl = `${THUMB_CDN}/${course.id}/chapter_thumbs/${lecture.slug}.jpg?width=200&quality=95&sharpen=true`

  const advance = () => {
    const next = nextRef.current
    if (!next) return
    setAdvancing(true)
    try {
      sessionStorage.setItem(PLAY_INTENT_KEY, keyOf(course.id, next.slug))
    } catch {
      /* ignore */
    }
    router.push(`/learn/${course.id}/${next.slug}`)
  }

  // Did we arrive here from an auto-advance? Then auto-play and keep the "Next up"
  // box up (with a spinner) until the video actually starts.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(PLAY_INTENT_KEY) === keyOf(course.id, lecture.slug)) {
        sessionStorage.removeItem(PLAY_INTENT_KEY)
        shouldPlayRef.current = true
        setStarting(true)
      } else {
        shouldPlayRef.current = false
        setStarting(false)
      }
    } catch {
      shouldPlayRef.current = false
    }
  }, [course.id, lecture.slug])

  // Resolve the signed URL — instantly from a fresh prefetch if available.
  useEffect(() => {
    if (!uuid) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setGated(false)
    setVideoUrl(null)
    setEnded(false)
    prefetchedRef.current = false

    const cached = getPrefetched(keyOf(course.id, lecture.slug), PREFETCH_MAX_AGE)
    if (cached) {
      setVideoUrl(cached)
      setLoading(false)
      return
    }
    fetchVideoUrl(uuid, course.id, lecture.slug).then((r) => {
      if (cancelled) return
      if (r.url) {
        setVideoUrl(r.url)
      } else {
        setError(r.error?.message || 'Unable to load this video.')
        if (r.error?.error === '403') setGated(true)
        setStarting(false)
      }
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [uuid, course.id, lecture.slug])

  // Player.js wiring: resume, progress, completion, auto-play, prefetch-next.
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
          // Attach listeners BEFORE play() — otherwise a fast 'play' event (browser-
          // timing dependent) fires before the listener exists and never clears `starting`.
          player.on('timeupdate', ({ seconds, duration }: { seconds: number; duration: number }) => {
            // Safety net: progressing playback always clears the "Next up" overlay,
            // even if the 'play' event was missed.
            if (seconds > 0.1) setStarting(false)
            if (duration && seconds / duration >= COMPLETE_THRESHOLD && !counted) {
              counted = true
              onCompleteRef.current && onCompleteRef.current()
            }
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
            setEnded(true)
          })
          player.on('play', () => {
            setStarting(false)
            setEnded(false)
            setDismissed(false)
            onPlayRef.current && onPlayRef.current()
            const next = nextRef.current
            if (!prefetchedRef.current && next && uuid) {
              prefetchedRef.current = true
              fetchVideoUrl(uuid, course.id, next.slug).then((r) => {
                if (r.url) setPrefetched(keyOf(course.id, next.slug), r.url)
              })
            }
          })
          player.on('pause', () => {
            player.getCurrentTime((s: number) => savePosition(videoId, s, 0))
          })

          // Resume position, then auto-play (listeners are now in place).
          const saved = getSavedPosition(videoId)
          if (saved && saved > 5) {
            player.getDuration((dur: number) => {
              // Only resume with a real duration and not near the end.
              if (dur && saved < dur - 15) player.setCurrentTime(saved)
            })
          }
          if (shouldPlayRef.current) {
            shouldPlayRef.current = false
            player.play()
          }
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

  // Auto-advance countdown after a video ends. Dismissing the box cancels it
  // (clears the pending timeout and the guard stops it re-arming).
  useEffect(() => {
    if (!ended || advancing || dismissed || !autoplay || !nextLecture) return
    const t = setTimeout(advance, AUTOPLAY_DELAY)
    return () => clearTimeout(t)
  }, [ended, advancing, dismissed, autoplay, nextLecture])

  let message = null
  if (isLoading) {
    message = (
      <>
        <Spinner />
        <p>Loading…</p>
      </>
    )
  } else if (!user) {
    message = (
      <>
        <p>Please sign in with your Patreon account to watch this video.</p>
        <Link href={`/account?returnTo=${encodeURIComponent(router.asPath)}`} className={styles.messageLink}>
          Sign in
        </Link>
      </>
    )
  } else if (loading) {
    message = (
      <>
        <Spinner />
        <p>Checking access…</p>
      </>
    )
  } else if (error || !videoUrl) {
    message = (
      <>
        <p>{error || 'Unable to load this video.'}</p>
        {gated && (
          <a href={PATREON_JOIN_URL} target="_blank" rel="noreferrer" className={styles.messageLink}>
            Get access for $7/month
          </a>
        )}
      </>
    )
  }

  // The "Next up" box: shown at end, while leaving, or while the next video starts.
  const showNextBox = (advancing || starting || (ended && nextLecture)) && !dismissed
  const showEndDone = ended && !nextLecture && !advancing && !starting
  const boxName = starting ? lecture.name : nextLecture && nextLecture.name
  const boxSlug = starting ? lecture.slug : nextLecture && nextLecture.slug

  let boxControl = null
  if (advancing || starting) {
    boxControl = <Spinner />
  } else if (autoplay) {
    boxControl = (
      <button className={styles.nextCountdown} onClick={advance} aria-label="Play next now">
        <svg className={styles.ring} viewBox="0 0 64 64">
          <circle className={styles.ringTrack} cx="32" cy="32" r="29" />
          <circle className={styles.ringFill} cx="32" cy="32" r="29" />
        </svg>
        <MdPlayArrow className={styles.icon} />
      </button>
    )
  } else {
    boxControl = (
      <button className={styles.nextPlay} onClick={advance} aria-label="Play next">
        <MdPlayArrow />
      </button>
    )
  }

  return (
    <>
      <div className={styles.player}>
        {videoUrl && (
          <iframe
            ref={iframeRef}
            src={videoUrl}
            title={lecture.name}
            loading="lazy"
            allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
          ></iframe>
        )}

        {message && !starting && (
          <>
            <img src={thumbUrl} className={styles.loadingThumb} alt="" aria-hidden="true" />
            <div className={styles.playerMessage}>{message}</div>
          </>
        )}

        {showNextBox && (
          <div className={styles.endscreen}>
            <div className={styles.nextBox}>
              <button className={styles.nextClose} onClick={() => setDismissed(true)} aria-label="Dismiss">
                <MdClose />
              </button>
              <div className={styles.nextText}>
                <div className={styles.nextLabelRow}>
                  <span className={styles.endLabel}>Next up</span>
                  {boxSlug && <span className={styles.nextTag}>{boxSlug}</span>}
                </div>
                <p className={styles.endTitle}>{boxName}</p>
              </div>
              <div className={styles.nextControl}>{boxControl}</div>
            </div>
          </div>
        )}

        {showEndDone && (
          <div className={styles.endscreen}>
            <div className={styles.endDone}>
              <p className={styles.endTitle}>You've reached the end</p>
              <Link href={`/learn/${course.id}`} className={styles.messageLink}>
                Back to overview
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default CourseVideo
