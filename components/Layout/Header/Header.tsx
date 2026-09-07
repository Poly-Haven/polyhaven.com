import Link from 'next/link'

import Nav from './Nav/Nav'

import styles from './Header.module.scss'

const header = () => {
  return (
    <div className={styles.header} id="mainheader">
      {/* On every page, so prefetching it fetches the home route data on every page view. */}
      <Link href="/" className={styles.logo} id="header-logo" prefetch={false}>
        <div className={styles.logo_image}>
          {/* Decorative: the link already reads "Poly Haven" next to it. */}
          <img src="/Logo 256.png" alt="" />
        </div>
        Poly Haven
      </Link>

      <div className={styles.spacer} />
      <div className={styles.assetHeader}>
        <h2 id="header-path" /> <h1 id="header-title" />
      </div>
      <div style={{ display: 'none' }} id="header-frompath" />
      <div className={styles.spacer} />
      <Nav />
    </div>
  )
}

export default header
