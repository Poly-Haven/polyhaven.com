import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import TextPage from 'components/Layout/TextPage/TextPage'
import GallerySubmit from 'components/Gallery/GallerySubmit'

export default function GalleryPage(props) {
  const { t } = useTranslation(['common', 'gallery'])

  return (
    <TextPage title={t('gallery:submit.title')} description={t('gallery:submit.description')} url="/gallery-submit">
      <GallerySubmit assets={props.assets} galleryApiUrl={props.galleryApiUrl} />
    </TextPage>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

// API failures throw rather than returning partial props: on revalidation that keeps the last good
// page in place, where partial props rendered a crash.
export async function getStaticProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const assets = await fetch(`${baseUrl}/assets?future=true`)
    .then(handleErrors)
    .then((response) => response.json())

  const sortedKeys = Object.keys(assets).sort((a, b) => assets[a].name.localeCompare(assets[b].name))

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'gallery'])),
      assets: sortedKeys,
      galleryApiUrl: process.env.NEXT_GALLERY_API_URL || 'https://gallery.polyhaven.com',
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}
