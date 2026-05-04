import Link from 'next/link'

import Nav from './Nav/Nav'

import styles from './Header.module.scss'

const header = () => {
  return (
    <header className={styles.header} id="mainheader">
      <Link href="/" className={styles.logo}>
        <div className={styles.logo_image}>
          <img src="/Logo 256.png" alt="Poly Haven logo" />
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
    </header>
  )
}

export default header
