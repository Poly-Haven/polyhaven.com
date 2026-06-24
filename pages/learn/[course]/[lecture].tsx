import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import CourseVideo from 'components/Courses/CourseVideo'
import CourseNav from 'components/Courses/CourseNav'

const LecturePage = ({ course, lecture }) => {
  return (
    <Page>
      <Head
        title={`${lecture.name} — ${course.name}`}
        description={lecture.description}
        url={`/learn/${course.id}/${lecture.slug}`}
      />
      <h1>{lecture.name}</h1>
      <CourseVideo course={course} lecture={lecture} />
      <CourseNav course={course} activeLecture={lecture.slug} />
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
