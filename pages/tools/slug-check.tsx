import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'

import SlugCheck from 'components/Tools/SlugCheck/SlugCheck'

export default function SlugCheckPage() {
  return (
    <Page>
      <Head
        title="Slug Check"
        description="Check for similar or matching asset slugs on Poly Haven."
        url="/tools/slug-check"
      />
      <div>
        <SlugCheck />
      </div>
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
