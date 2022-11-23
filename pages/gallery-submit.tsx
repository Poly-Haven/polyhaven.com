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

export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const assets = await fetch(`${baseUrl}/assets?future=true`)
    .then((response) => response.json())
    .catch((e) => (error = e))

  if (error) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ['common', 'gallery'])) },
      revalidate: 60 * 5, // 5 minutes
    }
  }

  const sortedKeys = Object.keys(assets).sort((a, b) => assets[a].name.localeCompare(assets[b].name))

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'gallery'])),
      assets: sortedKeys,
      galleryApiUrl: process.env.NEXT_ADMIN_API_URL || 'https://admin.polyhaven.com',
    },
    revalidate: 60 * 30, // 30 minutes
  }
}
