import { useState } from 'react'
import Link from 'next/link'
import { MdExpandMore, MdExpandLess, MdCheckCircle } from 'react-icons/md'

import { formatDuration } from 'utils/formatDuration'
import styles from './Courses.module.scss'

const THUMB_CDN = 'https://cdn.polyhaven.com/site_images/courses'

const chapterOf = (slug: string | null) => (slug ? slug.split('_')[0] : null)

// Collapsible chapter list. Used as the lecture-page sidebar (and the overview).
const CourseNav = ({ course, activeLecture = null, completed = new Set() }) => {
  const chapters = course.chapters || []
  const activeChapter = chapterOf(activeLecture) || (chapters[0] && chapters[0].slug)

  // Expand the active lecture's chapter by default; collapse the rest.
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    chapters.reduce((acc, ch) => ({ ...acc, [ch.slug]: ch.slug === activeChapter }), {})
  )
  const toggle = (slug: string) => setOpen((prev) => ({ ...prev, [slug]: !prev[slug] }))

  const allLectures = chapters.flatMap((ch) => ch.lectures || [])
  const doneTotal = allLectures.filter((l) => completed.has(l.slug)).length
  const pct = allLectures.length ? Math.round((doneTotal / allLectures.length) * 100) : 0

  return (
    <nav>
      <div className={styles.navHeader}>
        <strong>Course content</strong>
        <span className={styles.navProgress}>
          {doneTotal} / {allLectures.length} lectures complete
        </span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      {chapters.map((chapter) => {
        const isOpen = !!open[chapter.slug]
        const lectures = chapter.lectures || []
        const doneInCh = lectures.filter((l) => completed.has(l.slug)).length
        return (
          <div key={chapter.slug} className={styles.chapter}>
            <button className={styles.chapterHeader} onClick={() => toggle(chapter.slug)}>
              <span className={styles.chapterTitle}>{chapter.name}</span>
              <span className={styles.chapterCount}>
                {doneInCh}/{lectures.length}
              </span>
              {isOpen ? <MdExpandLess /> : <MdExpandMore />}
            </button>

            {isOpen &&
              lectures.map((lecture) => {
                const isActive = lecture.slug === activeLecture
                return (
                  <Link
                    key={lecture.slug}
                    href={`/learn/${course.id}/${lecture.slug}`}
                    className={`${styles.lecture} ${isActive ? styles.lectureActive : ''}`}
                  >
                    <img
                      className={styles.thumb}
                      src={`${THUMB_CDN}/${course.id}/${lecture.slug}.jpg?width=248&quality=90`}
                      alt=""
                      loading="lazy"
                    />
                    <div className={styles.lectureMeta}>
                      <div className={styles.lectureTitleRow}>
                        <span className={styles.lectureTag}>{lecture.slug}</span>
                        <span className={styles.lectureName}>{lecture.name}</span>
                      </div>
                      <div className={styles.lectureDuration}>{formatDuration(lecture.duration)}</div>
                    </div>
                    {completed.has(lecture.slug) && <MdCheckCircle className={styles.check} />}
                  </Link>
                )
              })}
          </div>
        )
      })}
    </nav>
  )
}

export default CourseNav
