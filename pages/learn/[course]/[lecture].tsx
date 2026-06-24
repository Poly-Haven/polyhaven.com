import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { SiDiscord } from 'react-icons/si'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import CourseVideo from 'components/Courses/CourseVideo'
import CourseNav from 'components/Courses/CourseNav'
import { useCourseProgress } from 'utils/courseProgress'
import styles from 'components/Courses/Courses.module.scss'

const LecturePage = ({ course, lecture }) => {
  const { completed, markCompleted, recordLastLecture } = useCourseProgress(course.id)

  return (
    <Page>
      <Head
        title={`${lecture.name} — ${course.name}`}
        description={lecture.description}
        url={`/learn/${course.id}/${lecture.slug}`}
      />
      <div className={styles.layout}>
        <div className={styles.main}>
          <CourseVideo
            course={course}
            lecture={lecture}
            onComplete={() => markCompleted(lecture.slug)}
            onPlay={() => recordLastLecture(lecture.slug)}
          />

          <div className={styles.titleRow}>
            <span className={styles.tag}>{lecture.slug}</span>
            <h1 className={styles.title}>{lecture.name}</h1>
          </div>

          <p className={styles.description}>{lecture.description}</p>

          <div className={styles.help}>
            <SiDiscord />
            <span>
              Need help?{' '}
              <a href="https://discord.gg/Dms7Mrs" target="_blank" rel="noreferrer">
                Join our Discord
              </a>{' '}
              for community support.
            </span>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <CourseNav course={course} activeLecture={lecture.slug} completed={completed} />
        </aside>
      </div>
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
