import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import Home from 'components/Home/Home'
import { SITE_JSON_LD } from 'utils/siteSeo'
import { cdnUrl } from 'utils/cdn'
import { getImageVersions } from 'utils/imageVersions'

export default function HomePage({ imageVersions }) {
  const ogImage = 'site_images/home/window_rend.jpg'
  return (
    <Page>
      <Head
        title="Poly Haven"
        description="The Public 3D Asset Library"
        url="/"
        image={cdnUrl(ogImage, { width: 630, quality: 95 }, imageVersions?.[ogImage])}
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
      // Non-asset image versions, consumed by _app's ImageVersionsProvider and by every component
      // below it via useSiteImg. Fetched here rather than per pageview: this runs at build time
      // and on revalidation only, and the Nav's per-pageview API calls are already the expensive
      // part of a page load.
      imageVersions: await getImageVersions(['site_images/home', 'site_images/logo', 'people', 'corporate_sponsors', 'vaults']),
    },
  }
}
