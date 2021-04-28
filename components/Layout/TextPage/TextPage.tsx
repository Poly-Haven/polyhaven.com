import Head from 'next/head';

import Page from 'components/Layout/Page/Page'

import styles from './TextPage.module.scss'

const TextPage = ({ title, children }) => {
  return (
    <Page>
      <Head>
        <title>{title} • Poly Haven</title>
      </Head>
      <div className={styles.page}>
        {children}
      </div>
    </Page>
  )
}

export default TextPage
