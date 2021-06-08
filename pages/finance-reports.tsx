import Head from 'next/head'

import Page from 'components/Layout/Page/Page'
import Finances from 'components/Finances/Finances'

export default function HomePage() {
  return (
    <Page>
      <Head>
        <title>Finance Reports • Poly Haven</title>
      </Head>
      <Finances />
    </Page>
  )
}
