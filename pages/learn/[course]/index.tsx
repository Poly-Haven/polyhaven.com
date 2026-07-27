import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import CoursesLanding from 'components/Courses/CoursesLanding'
import { COURSE_SEO, buildCourseJsonLd } from 'components/Courses/courseSeo'

const CourseOverview = ({ course }) => {
  const seo = COURSE_SEO[course.id] || {}
  const jsonLd = buildCourseJsonLd(course)

  return (
    <Page>
      <Head
        title={course.name}
        description={course.description}
        url={`/learn/${course.id}`}
        image={seo.image}
        keywords={seo.keywords}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      </Head>
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

  // The rendered HTML is identical for every visitor — access state is resolved
  // client-side by UserPatronContext — so it's safe to cache at the edge. Keeps
  // TTFB (and so LCP) low for crawlers and cold visitors alike.
  context.res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=3600')

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      course,
    },
  }
}

export default CourseOverview
