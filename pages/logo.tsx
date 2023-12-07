import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import TextPage from 'components/Layout/TextPage/TextPage'
import LogoGuidelines from 'components/LogoGuidelines/LogoGuidelines'

const FAQ = () => {
  const { t } = useTranslation(['common'])

  return (
    <TextPage
      title="Poly Haven Logo Guidelines"
      description="While our assets are CC0, our logo is not, but we do allow you to use it in certain ways."
      url="/logo"
    >
      <LogoGuidelines />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default FAQ
