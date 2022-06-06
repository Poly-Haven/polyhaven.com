import TextPage from 'components/Layout/TextPage/TextPage'
import GallerySubmit from 'components/Gallery/GallerySubmit'

export default function GalleryPage(props) {
  return (
    <TextPage
      title="Submit Your Render"
      description="Have you created some awesome artwork using one of our assets? Show it off on this site!"
      url="/gallery-submit"
    >
      <GallerySubmit assets={props.assets} galleryApiUrl={props.galleryApiUrl} />
    </TextPage>
  )
}

export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"
  const assets = await fetch(`${baseUrl}/assets`)
    .then(response => response.json())
    .catch(e => error = e)

  if (error) {
    return {
      props: {},
      revalidate: 60 * 5 // 5 minutes
    }
  }

  const sortedKeys = Object.keys(assets).sort((a, b) => assets[a].name.localeCompare(assets[b].name))
  const sortedAssets = {}
  for (const k of sortedKeys) {
    sortedAssets[k] = assets[k]
  }

  return {
    props: {
      assets: sortedAssets,
      galleryApiUrl: process.env.NEXT_ADMIN_API_URL || "https://admin.polyhaven.com",
    },
    revalidate: 60 * 30 // 30 minutes
  }
}