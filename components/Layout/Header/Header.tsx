import Link from 'next/link';
import { ImWarning } from 'react-icons/im'

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
      <div className={styles.beta}><ImWarning /> <p>BETA {process.env.CONFIG_BUILD_ID}</p></div>
      <div className={styles.spacer} />
      <Nav />
    </div>
  );
}

export default header;