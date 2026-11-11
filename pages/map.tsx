import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import { MapHdri, toMapHdri } from 'components/Map/mapData'
import { getImageVersions } from 'utils/imageVersions'

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
// that each entry also carries a name, image version, date and photographer.
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
      hdris.push(toMapHdri(slug, info, round))
    }
  }
  const photographers = Array.from(new Set(hdris.map((h) => h[6]).filter(Boolean)))

  return {
    props: {
      // `time` for the popups' "12 weeks ago".
      ...(await serverSideTranslations(ctx.locale, ['common', 'map', 'time'])),
      // Avatar versions for just the photographers on the map, not the whole people/ folder.
      imageVersions: await getImageVersions(photographers.map((name) => `people/${name}.`)),
      hdris,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}

export default MapPage
