import NewsCard from 'components/Library/Grid/GridItem/NewsCard'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'

import styles from 'components/Library/Grid/Grid.module.scss'

export default function HomePage() {
  return (
    <Page>
      <Head title="Test Newscards" description="Page for testing probability of news cards!" url="/testnc" />
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <div className={styles.grid}>
          {Array.from({ length: 24 }).map((_, index) => (
            <NewsCard key={index} isMobile={false} />
          ))}
        </div>
      </div>
    </Page>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
