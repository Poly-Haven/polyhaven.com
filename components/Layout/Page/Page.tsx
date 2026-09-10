import Footer from 'components/Layout/Footer/Footer'

import styles from './Page.module.scss'

const Page = ({ children, immersiveScroll, library, assetPage }) => {
  return (
    <div
      id="page"
      className={`${styles.page} ${immersiveScroll ? styles.immersiveScroll : ''} ${library ? styles.library : ''} ${
        assetPage ? styles.assetPage : ''
      }`}
    >
      <main className={styles.pageContent}>{children}</main>
      <Footer />
    </div>
  )
}

Page.defaultProps = {
  immersiveScroll: false,
  library: false,
  assetPage: false,
}

export default Page
