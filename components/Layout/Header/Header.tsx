import Link from 'next/link';

import GoalProgress from 'components/UI/ProgressBar/GoalProgress'
import Nav from './Nav/Nav'

import styles from './Header.module.scss';

const header = () => {

  return (
    <div className={styles.header}>
      <Link href='/'><a className={styles.logo}>
        <div className={styles.logo_image}>
          <img src='/Logo 256.png' />
        </div>
        Poly Haven
      </a></Link>
      <div className={styles.spacer} />
      <div className={styles.assetHeader}><h2 id='header-path' /> <h1 id='header-title' /></div>
      <div style={{ display: 'none' }} id='header-frompath' />
      <div className={styles.spacer} />
      <a href="https://www.patreon.com/polyhaven/overview" className={styles.progressBar}>
        <GoalProgress mode="small" />
      </a>
      <Nav />
    </div>
  );
}

export default header;