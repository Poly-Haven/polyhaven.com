import Footer from 'components/Footer/Footer'

import styles from './Page.module.scss'

const Page = ({ children }) => {
  return (
    <div className={styles.page}>
      <div className={styles.pageContent}>{children}</div>
      <Footer />
    </div>
  )
}

export default Page
