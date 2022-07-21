import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import TextPage from 'components/Layout/TextPage/TextPage'
import FaqPage from 'components/FaqPage/FaqPage'

const FAQ = () => {
  const { t } = useTranslation(['common', 'faq']);

  return (
    <TextPage
      title={t('common:nav.faq')}
      description={t('faq:description')}
      url="/faq"
    >
      <FaqPage />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'faq'])),
    },
  };
}

export default FAQ