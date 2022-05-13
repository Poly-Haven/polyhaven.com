import TextPage from 'components/Layout/TextPage/TextPage'
import GallerySubmit from 'components/Gallery/GallerySubmit'

export default function GalleryPage(props) {
  return (
    <TextPage
      title="Submit Your Render"
      description="Have you created some awesome artwork using one of our assets? Show it off on this site!"
      url="/gallery-submit"
    >
      <GallerySubmit assets={props.assets} />
    </TextPage>
  )
}

export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://lbtest.polyhaven.com"
  const assets = await fetch(`${baseUrl}/assets`)
    .then(response => response.json())
    .catch(e => error = e)

  if (error) {
    return {
      props: {},
      revalidate: 60 * 5 // 5 minutes
    }
  }

  return {
    props: {
      assets: assets
    },
    revalidate: 60 * 30 // 30 minutes
  }
}