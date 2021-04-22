import Footer from 'components/Layout/Footer/Footer'

import styles from './Page.module.scss'

const Page = ({ children }) => {
  return (
    <div className={styles.page}>
      <div className={styles.pageContentCentered}>{children}</div>
      <Footer />
    </div>
  )
}

export default Page
