import { useTranslation } from 'next-i18next';

import styles from './Slider.module.scss'

const Slider = () => {
  const { t } = useTranslation('common');
  return (
    <div className={styles.wrapper}>
      <img src='/Logo 256.png' className={styles.logo} />
      <h1>Poly Haven</h1>
      <p>{t('tagline')}</p>
    </div>
  )
}

export default Slider
