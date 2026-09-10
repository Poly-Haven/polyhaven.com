import Footer from 'components/Layout/Footer/Footer'

import styles from './Page.module.scss'

const Page = ({ children }) => {
  return (
    <div className={styles.page}>
      <main className={styles.pageContentCentered}>{children}</main>
      <Footer />
    </div>
  )
}

export default Page
