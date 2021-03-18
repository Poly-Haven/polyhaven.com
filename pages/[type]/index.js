import Head from 'next/head'
import { useRouter } from 'next/router'

import Layout from '../../components/Layout/Layout'

export default function Home() {
  const router = useRouter()

  return (
    <div className="App">
      <Head>
        <title>{router.query.type} | Poly Haven</title>
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
        <Layout />
      </header>
    </div>
  )
}
