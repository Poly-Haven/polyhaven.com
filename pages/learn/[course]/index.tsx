import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import CoursesLanding from 'components/Courses/CoursesLanding'

const CourseOverview = ({ course }) => {
  return (
    <Page>
      <Head title={course.name} description={course.description} url={`/learn/${course.id}`} />
      <CoursesLanding course={course} />
    </Page>
  )
}

export async function getServerSideProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const course = await fetch(`${baseUrl}/courses/${context.params.course}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)

  if (!course) return { notFound: true }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      course,
    },
  }
}

export default CourseOverview
