import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'

import dynamic from 'next/dynamic'
const Map = dynamic(() => import('../components/Map/Map'), {
  ssr: false,
})

const MapPage = ({ coords }) => {
  return (
    <Page>
      <Head title="Map" description="World map of locations where we've captured HDRIs." url="/map" />
      <Map hdris={coords} />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export const getStaticProps = async (ctx) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const data = await fetch(`${baseUrl}/assets?t=hdris&future=true`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => console.log(e))

  const coords = {}
  for (const [slug, info] of Object.entries(data)) {
    if (info['coords'] && !slug.endsWith('_puresky')) {
      coords[slug] = info['coords']
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      coords,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}

export default MapPage
