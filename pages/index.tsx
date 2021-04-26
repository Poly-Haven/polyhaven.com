import Head from 'next/head'

import Page from 'components/Layout/Page/Page'
import Home from 'components/Home/Home'

export default function HomePage() {
  return (
    <Page>
      <Head>
        <title>Poly Haven</title>
      </Head>
      <Home patreonGoal="TODO" patreonProgress={80} />
    </Page>
  )
}
