import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import type { MapHdri } from 'components/Map/Map'

import dynamic from 'next/dynamic'
const Map = dynamic(() => import('../components/Map/Map'), {
  ssr: false,
})

const MapPage = ({ hdris }: { hdris: MapHdri[] }) => {
  const { t } = useTranslation(['common', 'map'])
  return (
    <Page>
      <Head title={t('common:nav.map')} description={t('map:description')} url="/map" />
      <Map hdris={hdris} />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

// Markers are approximate anyway, and 4 decimals (~10m) keeps the page's __NEXT_DATA__ small now
// that each entry also carries a name and image version.
const round = (n: number) => Math.round(n * 1e4) / 1e4

export const getStaticProps = async (ctx) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const data = await fetch(`${baseUrl}/assets?t=hdris&future=true`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => console.log(e))

  const hdris: MapHdri[] = []
  for (const [slug, info] of Object.entries<any>(data)) {
    if (info['coords'] && !slug.endsWith('_puresky')) {
      const [lat, lon] = info['coords']
      hdris.push([slug, round(lat), round(lon), info['name'], info['img_version'] || null])
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common', 'map'])),
      hdris,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}

export default MapPage
