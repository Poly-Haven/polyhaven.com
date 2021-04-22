import Nav from './Nav/Nav'

import styles from './Header.module.scss';

const header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logo_image}>
          <img src='/Logo 256.png' />
        </div>
        Poly Haven
      </div>
      <div className={styles.spacer} />
      <Nav />
    </div>
  );
}

export default header;