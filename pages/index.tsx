import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Home from 'components/Home/Home'

export default function HomePage() {
  return (
    <Page>
      <Head
        title="Poly Haven"
        description="The Public Asset Library"
        url="/"
      />
      <Home />
    </Page>
  )
}
