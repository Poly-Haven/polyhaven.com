import { useState, useEffect } from 'react'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import CourseVideo from 'components/Courses/CourseVideo'
import CourseNav from 'components/Courses/CourseNav'
import CourseInfo from 'components/Courses/CourseInfo'
import { useCourseProgress } from 'utils/courseProgress'
import { getAutoplay, setAutoplay } from 'utils/courseProgressLocal'
import styles from 'components/Courses/Courses.module.scss'

const LecturePage = ({ course, lecture }) => {
  const { completed, markCompleted, recordLastLecture } = useCourseProgress(course.id)

  // Auto-advance preference (persisted; read client-side to avoid hydration mismatch).
  const [autoplay, setAutoplayState] = useState(false)
  useEffect(() => {
    setAutoplayState(getAutoplay())
  }, [])
  const toggleAutoplay = () =>
    setAutoplayState((v) => {
      const next = !v
      setAutoplay(next)
      return next
    })

  // The next lecture in overall order (across chapters).
  const flat = (course.chapters || []).flatMap((c) => c.lectures || [])
  const idx = flat.findIndex((l) => l.slug === lecture.slug)
  const nextLecture = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null

  return (
    <Page>
      <Head
        title={`${lecture.name} • ${course.name}`}
        description={lecture.description}
        url={`/learn/${course.id}/${lecture.slug}`}
      />
      <div className={styles.stage}>
        <div className={styles.video}>
          <CourseVideo
            key={lecture.slug}
            course={course}
            lecture={lecture}
            nextLecture={nextLecture}
            autoplay={autoplay}
            onComplete={() => markCompleted(lecture.slug)}
            onPlay={() => recordLastLecture(lecture.slug)}
          />
        </div>
        <aside className={styles.sidebar}>
          <CourseNav
            course={course}
            activeLecture={lecture.slug}
            completed={completed}
            autoplay={autoplay}
            onToggleAutoplay={toggleAutoplay}
          />
        </aside>
      </div>

      <CourseInfo course={course} />
    </Page>
  )
}

export async function getServerSideProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const course = await fetch(`${baseUrl}/courses/${context.params.course}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  if (!course) return { notFound: true }

  let lecture = null
  for (const chapter of course.chapters || []) {
    for (const l of chapter.lectures || []) {
      if (l.slug === context.params.lecture) lecture = l
    }
  }
  if (!lecture) return { notFound: true }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      course,
      lecture,
    },
  }
}

export default LecturePage
