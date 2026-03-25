import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import Lighthouse from 'components/Projects/Lighthouse'

export default function ProjectLighthouse() {
  return (
    <Page>
      <Head
        title="Project Lighthouse"
        description="Poly Haven's biggest adventure yet"
        url="/project/lighthouse"
        image="https://cdn.polyhaven.com/site_images/projects/lighthouse/feature.jpg?width=630&quality=95"
      />
      <Lighthouse />
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'time'])),
    },
  }
}
