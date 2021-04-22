import Head from 'next/head';

import Page from 'components/Layout/Page/CenteredPage'

export default function Custom404() {
  return (
    <Page>
      <Head>
        <title>
          Error: 404
        </title>
      </Head>
      <h1>404</h1>
      <p>Page Not Found</p>
    </Page>
  )
}
