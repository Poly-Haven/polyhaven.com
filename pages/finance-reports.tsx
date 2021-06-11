import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Finances from 'components/Finances/Finances'

export default function HomePage() {
  return (
    <Page>
      <Head
        title="Finance Reports"
        description="Detailed historical records of our earnings, spending, and savings."
        url="/finance-reports"
      />
      <Finances />
    </Page>
  )
}
