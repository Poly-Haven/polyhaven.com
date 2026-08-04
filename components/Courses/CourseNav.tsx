import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  MdExpandMore,
  MdExpandLess,
  MdCheckCircle,
  MdPause,
  MdPlayArrow,
  MdArrowUpward,
  MdArrowDownward,
} from 'react-icons/md'
import { SiDiscord } from 'react-icons/si'

import { formatDuration } from 'utils/formatDuration'
import Switch from 'components/UI/Switch/Switch'
import IconButton from 'components/UI/Button/IconButton'
import styles from './Courses.module.scss'

const THUMB_CDN = 'https://cdn.polyhaven.com/site_images/courses'
const DISCORD_URL = 'https://discord.gg/Dms7Mrs'

const chapterOf = (slug: string | null) => (slug ? slug.split('_')[0] : null)

const Thumb = ({ courseId, lecture }) => (
  <div className={styles.thumb}>
    <img
      src={`${THUMB_CDN}/${courseId}/chapter_thumbs/${lecture.slug}.jpg?width=200&quality=95&sharpen=true`}
      alt=""
      loading="lazy"
    />
    <span className={styles.duration}>{formatDuration(lecture.duration)}</span>
  </div>
)

const CourseNav = ({
  course,
  activeLecture = null,
  completed = new Set(),
  autoplay = false,
  onToggleAutoplay = () => {},
}) => {
  const chapters = course.chapters || []
  const activeChapter = chapterOf(activeLecture) || (chapters[0] && chapters[0].slug)

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    chapters.reduce((acc, ch) => ({ ...acc, [ch.slug]: ch.slug === activeChapter }), {})
  )
  const toggle = (slug: string) => setOpen((prev) => ({ ...prev, [slug]: !prev[slug] }))

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const activeRef = useRef<HTMLDivElement | null>(null)
  const [jumpDir, setJumpDir] = useState<'up' | 'down' | null>(null)

  const allLectures = chapters.flatMap((ch) => ch.lectures || [])
  const doneTotal = allLectures.filter((l) => completed.has(l.slug)).length
  const pct = allLectures.length ? Math.round((doneTotal / allLectures.length) * 100) : 0

  const scrollActiveIntoView = useCallback((smooth: boolean) => {
    const root = scrollRef.current
    const target = activeRef.current
    if (!root || !target) return
    const rootRect = root.getBoundingClientRect()
    const tRect = target.getBoundingClientRect()
    const top = root.scrollTop + (tRect.top - rootRect.top) - (root.clientHeight - tRect.height) / 2
    root.scrollTo({ top: Math.max(0, top), behavior: smooth ? 'smooth' : 'auto' })
  }, [])

  // Ensure the active chapter is open, then center the active lecture.
  useEffect(() => {
    if (activeChapter) setOpen((prev) => (prev[activeChapter] ? prev : { ...prev, [activeChapter]: true }))
    const id = requestAnimationFrame(() => scrollActiveIntoView(true))
    return () => cancelAnimationFrame(id)
  }, [activeLecture, activeChapter, scrollActiveIntoView])

  // Show the jump button when the active lecture is scrolled out of view.
  useEffect(() => {
    const root = scrollRef.current
    const target = activeRef.current
    if (!root || !target || !activeLecture) {
      setJumpDir(null)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setJumpDir(null)
        } else {
          const rb = entry.rootBounds
          setJumpDir(rb && entry.boundingClientRect.top < rb.top ? 'up' : 'down')
        }
      },
      { root, threshold: 0 }
    )
    obs.observe(target)
    return () => obs.disconnect()
  }, [activeLecture, open])

  return (
    <div className={styles.nav}>
      <div className={styles.navScroll} ref={scrollRef}>
        <div className={styles.navHeader}>
          <Link href={`/learn/${course.id}`} className={styles.courseTitle}>
            {course.name}
          </Link>
          <div className={styles.navProgressRow}>
            <div className={styles.navProgressInfo}>
              <span className={styles.navProgress}>
                {doneTotal} / {allLectures.length} complete
              </span>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${pct}%` }} />
              </div>
            </div>
            <span data-tip={autoplay ? 'Turn auto-play off' : 'Turn auto-play on'}>
              <Switch on={autoplay} onClick={onToggleAutoplay} labelOff={<MdPause />} labelOn={<MdPlayArrow />} />
            </span>
          </div>
        </div>

        {chapters.map((chapter) => {
          const isOpen = !!open[chapter.slug]
          const lectures = chapter.lectures || []
          const doneInCh = lectures.filter((l) => completed.has(l.slug)).length
          const highlightHeader = activeLecture && chapter.slug === activeChapter && !isOpen
          return (
            <div key={chapter.slug} className={styles.chapter}>
              <button
                className={`${styles.chapterHeader} ${highlightHeader ? styles.chapterActive : ''}`}
                onClick={() => toggle(chapter.slug)}
              >
                <span className={styles.chapterTitle}>{chapter.name}</span>
                <span className={styles.chapterCount}>
                  {doneInCh}/{lectures.length}
                </span>
                {isOpen ? <MdExpandLess /> : <MdExpandMore />}
              </button>

              {isOpen &&
                lectures.map((lecture) => {
                  const isActive = lecture.slug === activeLecture
                  const isDone = completed.has(lecture.slug)

                  if (isActive) {
                    return (
                      <div key={lecture.slug} className={styles.activeBlock} ref={activeRef}>
                        <div className={styles.lecture}>
                          <Thumb courseId={course.id} lecture={lecture} />
                          <div className={styles.lectureMeta}>
                            <div className={styles.tagRow}>
                              <span className={styles.lectureTag}>{lecture.slug}</span>
                              {isDone && <MdCheckCircle className={styles.check} />}
                            </div>
                            <span className={styles.lectureName}>{lecture.name}</span>
                          </div>
                        </div>
                        <div className={styles.activeDesc}>{lecture.description}</div>
                        <div className={styles.helpMini}>
                          <SiDiscord />
                          <span>
                            Need help?{' '}
                            <a href={DISCORD_URL} target="_blank" rel="noreferrer">
                              Join our Discord
                            </a>
                          </span>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link key={lecture.slug} href={`/learn/${course.id}/${lecture.slug}`} className={styles.lecture}>
                      <Thumb courseId={course.id} lecture={lecture} />
                      <div className={styles.lectureMeta}>
                        <div className={styles.tagRow}>
                          <span className={styles.lectureTag}>{lecture.slug}</span>
                          {isDone && <MdCheckCircle className={styles.check} />}
                        </div>
                        <span className={styles.lectureName}>{lecture.name}</span>
                        <span className={styles.excerpt}>{lecture.description}</span>
                      </div>
                    </Link>
                  )
                })}
            </div>
          )
        })}
      </div>

      {jumpDir && (
        <span className={styles.jumpWrap} data-tip="Scroll to current lecture">
          <IconButton
            active
            icon={jumpDir === 'up' ? <MdArrowUpward /> : <MdArrowDownward />}
            onClick={() => scrollActiveIntoView(true)}
          />
        </span>
      )}
    </div>
  )
}

export default CourseNav
