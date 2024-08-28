import Link from 'next/link'

import Nav from './Nav/Nav'

import styles from './Header.module.scss'

const header = () => {
  return (
    <div className={styles.header} id="mainheader">
      <Link href="/" className={styles.logo}>
        <div className={styles.logo_image}>
          <img src="/Logo 256.png" />
        </div>
        Poly Haven
      </Link>

      <img
        src="https://ads.polyhaven.org/architextures/1px.png"
        className={styles.testPixel}
        data-comment="Transparent pixel images to gauge ad-blocking prevalence. This is for statistical curiosity only - Poly Haven respects user choices and does not attempt to circumvent ad blocking"
      />
      <img src="https://u.polyhaven.org/X4c/1px.png" className={styles.testPixel} />

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
