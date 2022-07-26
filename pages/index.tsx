import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import Home from 'components/Home/Home'

export default function HomePage() {
  return (
    <Page>
      <Head
        title="Poly Haven"
        description="The Public 3D Asset Library"
        url="/"
        image="https://cdn.polyhaven.com/site_images/home/window_rend.jpg?width=630"
      />
      <Home />
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'home', 'time'])),
    },
  };
}
