import Image from 'next/image'

import styles from './Header.module.scss';

const header = () => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logo_image}>
          <Image
            src='/Logo 256.png'
            width={36}
            height={36}
          />
        </div>
        Poly Haven
      </div>
    </div>
  );
}

export default header;