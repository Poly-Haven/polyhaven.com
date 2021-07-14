import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Gallery from 'components/Gallery/Gallery'

export default function GalleryPage(props) {
  return (
    <Page>
      <Head
        title="Render Gallery"
        description="Artwork submitted by dozens of users, created using our assets."
        url="/gallery"
      />
      <h1 style={{
        textAlign: 'center',
        marginTop: '1.5em',
        marginBottom: 0
      }}>Render Gallery</h1>
      <p style={{
        textAlign: 'center',
        fontStyle: 'italic'
      }}>Artwork submitted by dozens of users, created using our assets.</p>
      <Gallery data={props.data} />
    </Page>
  )
}

export async function getStaticProps(context) {
  let error = null
  const baseUrl = (process.env.NODE_ENV == "production" || process.env.POLYHAVEN_API == "live") ? "https://api.polyhaven.com" : "http://localhost:3000"
  const data = await fetch(`${baseUrl}/gallery`)
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
      data: data
    },
    revalidate: 60 * 30 // 30 minutes
  }
}