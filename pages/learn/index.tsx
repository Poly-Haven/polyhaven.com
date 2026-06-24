import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import CoursesLanding from 'components/Courses/CoursesLanding'

export default function CollectionsPage({ vaults }) {
  const { t } = useTranslation(['common'])

  return (
    <Page>
      <Head
        title="Learn"
        description="Training content from Poly Haven"
        url="/learn"
        image={`https://cdn.polyhaven.com/vaults/beach.png?width=580&quality=95`} // TODO
      />
      <CoursesLanding />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export async function getStaticProps({ locale }) {
  // const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  // let error = null
  // const courses = await fetch(`${baseUrl}/courses`)
  //   .then(handleErrors)
  //   .then((response) => response.json())
  //   .catch((e) => (error = e))

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      // courses: courses,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}
