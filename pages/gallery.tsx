import Head from 'components/Head/Head'
import Link from 'next/link';

import IconButton from 'components/UI/Button/IconButton';
import Page from 'components/Layout/Page/Page'
import Gallery from 'components/Gallery/Gallery'

import { MdAdd } from "react-icons/md";

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
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '1em',
      }}>
        <p><em>Artwork submitted by dozens of users, created using our <Link href="/all"><a>assets</a></Link>.</em></p>
        <Link href={`/gallery-submit`} prefetch={false}><a><IconButton icon={<MdAdd />} label="Add yours" /></a></Link>
      </div>
      <Gallery data={props.data} />
    </Page>
  )
}

export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"
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