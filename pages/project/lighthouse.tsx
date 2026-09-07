import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getImageVersions } from 'utils/imageVersions'
import { cdnUrl } from 'utils/cdn'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import Lighthouse from 'components/Projects/Lighthouse'

const OG_IMAGE = 'site_images/projects/lighthouse/feature.jpg'

export default function ProjectLighthouse({ imageVersions }) {
  return (
    <Page>
      <Head
        title="Project Lighthouse"
        description="Poly Haven's biggest adventure yet"
        url="/project/lighthouse"
        image={cdnUrl(OG_IMAGE, { width: 630, quality: 95 }, imageVersions?.[OG_IMAGE])}
      />
      <Lighthouse />
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'time'])),
      // Non-asset image versions for _app's ImageVersionsProvider. Fetched here rather than per
      // pageview: getStaticProps runs at build time and on revalidation only.
      imageVersions: await getImageVersions(['site_images/projects/lighthouse', 'site_images/logo']),
    },
  }
}
