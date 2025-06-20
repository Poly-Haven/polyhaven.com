import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Collections from 'components/Library/Collections/Collections'

export default function CollectionsPage({ collections }) {
  const { t } = useTranslation(['common', 'collections'])

  return (
    <Page>
      <Head
        title={t('collections:title')}
        description={t('collections:description')}
        url="/collections"
        image="https://cdn.polyhaven.com/collections/the-shed.png?width=630&quality=95"
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
      collections: collections,
    },
    revalidate: 60 * 60 * 2, // 2 hours
  }
}
