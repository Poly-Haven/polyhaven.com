import Link from 'next/link';
import { MdWarning } from 'react-icons/md'

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
      <div className={styles.beta}>
        <MdWarning />
        <p>BETA</p>
        <pre>{process.env.CONFIG_BUILD_ID.substring(0, 7)}</pre>
      </div>
      <div className={styles.spacer} />
      <Nav />
    </div>
  );
}

export default header;