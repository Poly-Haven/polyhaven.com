import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import Home from 'components/Home/Home'
import { SITE_JSON_LD } from 'utils/siteSeo'

export default function HomePage() {
  return (
    <Page>
      <Head
        title="Poly Haven"
        description="The Public 3D Asset Library"
        url="/"
        image="https://cdn.polyhaven.com/site_images/home/window_rend.jpg?width=630&quality=95"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD).replace(/</g, '\\u003c') }}
        />
      </Head>
      <Home />
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'home', 'time'])),
    },
  }
}
