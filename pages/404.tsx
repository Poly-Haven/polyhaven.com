import Head from 'next/head';

import Page from 'components/Layout/Page/CenteredPage'

export default function Custom404() {
  return (
    <Page>
      <Head>
        <title>¯\_(ツ)_/¯</title>
        <meta
          name="description"
          content="Page not found."
        />
      </Head>
      <h1>404</h1>
      <p>Page Not Found</p>
    </Page>
  )
}
