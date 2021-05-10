import Footer from 'components/Layout/Footer/Footer'

import styles from './Page.module.scss'

const Page = ({ children, immersiveScroll }) => {
  return (
    <div id='page' className={`${styles.page} ${immersiveScroll ? styles.immersiveScroll : ""}`}>
      <div className={styles.pageContent}>{children}</div>
      <Footer />
    </div>
  )
}

Page.defaultProps = {
  immersiveScroll: false
}

export default Page
