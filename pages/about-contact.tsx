import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getImageVersions } from 'utils/imageVersions'
import { useTranslation } from 'next-i18next'

import TextPage from 'components/Layout/TextPage/TextPage'
import AboutContact from 'components/AboutContact/AboutContact'

const AboutPage = () => {
  const { t } = useTranslation(['common', 'about'])

  return (
    <TextPage title={t('about:title')} description={t('about:description')} url="/about-contact">
      <AboutContact />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'about'])),
      // Non-asset image versions for _app's ImageVersionsProvider. Fetched here rather than per
      // pageview: getStaticProps runs at build time and on revalidation only.
      imageVersions: await getImageVersions(['people']),
    },
  }
}

export default AboutPage
