import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getImageVersions } from 'utils/imageVersions'
import { cdnUrl } from 'utils/cdn'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Collections from 'components/Library/Collections/Collections'

export default function CollectionsPage({ collections, imageVersions }) {
  const { t } = useTranslation(['common', 'collections'])

  return (
    <Page>
      <Head
        title={t('collections:title')}
        description={t('collections:description')}
        url="/collections"
        image={cdnUrl('collections/the-shed.png', { width: 630, quality: 95 }, imageVersions?.['collections/the-shed.png'])}
      />
      <Collections collections={collections} />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export async function getStaticProps({ locale }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const collections = await fetch(`${baseUrl}/collections`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'collections'])),
      // Non-asset image versions for _app's ImageVersionsProvider. Fetched here rather than per
      // pageview: getStaticProps runs at build time and on revalidation only.
      imageVersions: await getImageVersions(['collections']),
      collections: collections,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}
