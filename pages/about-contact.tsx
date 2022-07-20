import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import TextPage from 'components/Layout/TextPage/TextPage'
import AboutContact from 'components/AboutContact/AboutContact'

const AboutPage = () => {
  return (
    <TextPage
      title="About / Contact"
      description="What Poly Haven is, what we do, and why we're doing it."
      url="/about-contact"
    >
      <AboutContact />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'about'])),
    },
  };
}

export default AboutPage