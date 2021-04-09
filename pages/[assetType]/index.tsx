import Head from 'next/head'
import { useRouter } from 'next/router'

import asset_types from 'constants/asset_types.json';

import Library from 'containers/Library/Library'

const Page = () => {
  const router = useRouter()

  const { assetType } = router.query;
  // const assetType = "textures";

  return (
    <div className="App">
      <Head>
        <title>{assetType} | Poly Haven</title>
        <link rel="icon" href="/favicon.ico" />

        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap" rel="stylesheet" />

        {/* Meta */}
        <meta
          name="description"
          content="The Public Asset Library"
        />
      </Head>

      <header className="App-header">
        <Library assetType={assetType} />
      </header>
    </div>
  )
}

export async function getStaticPaths() {
  const typesAvailable = asset_types;
  const paths = Object.keys(typesAvailable).map((t) => ({
    params: { assetType: t }
  }))
  return { paths, fallback: false }
}

export async function getStaticProps() {
  return {
    props: {}
  }
}

export default Page;
