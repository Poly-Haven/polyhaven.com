import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import TextPage from 'components/Layout/TextPage/TextPage'
import FaqPage from 'components/FaqPage/FaqPage'

const FAQ = () => {
  return (
    <TextPage
      title="FAQ"
      description="Frequently questions and their answers."
      url="/faq"
    >
      <FaqPage />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default FAQ