import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'components/Head/Head'

import TextPage from 'components/Layout/TextPage/TextPage'

export default function HomePage({ datasets }) {
  return (
    <TextPage title="Stats" description="Site statistics for polyhaven.com." url="/stats">
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>🛠️ Stats page currently under maintenance</h1>
      </div>
    </TextPage>
  )
}

export async function getStaticProps(context) {
  return {
    props: { ...(await serverSideTranslations(context.locale, ['common'])) },
    revalidate: 60 * 60, // 60 minutes
  }
}
