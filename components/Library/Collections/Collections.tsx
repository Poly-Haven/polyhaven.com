import { useTranslation } from 'next-i18next'
import Link from 'next/link'

import Heart from 'components/UI/Icons/Heart'

import styles from './Collections.module.scss'

const Collections = () => {
  const { t } = useTranslation(['common', 'collections'])

  return (
    <div className={styles.wrapper}>
      <h1>Poly Haven Collections</h1>
      <p>{t('collections:description')}</p>
      <div className={styles.collectionsList}>
        <Link href="/all">
          <a className={styles.collection}>
            <img src="https://cdn.polyhaven.com/collections/the-shed.png?width=630" alt="The Shed" />
            <div className={styles.row}>
              <div className={`${styles.col} ${styles.alignLeft}`}>
                <h2>The Shed</h2>
                <p>
                  <Heart color="#F96854" /> Community Project
                </p>
              </div>
              <div className={`${styles.col} ${styles.alignRight}`}>
                <p>49 models</p>
              </div>
            </div>
            <div className={styles.row}>
              <p>Download Scene File</p>
              <p>[list of asset thumbnails]</p>
            </div>
          </a>
        </Link>
      </div>
    </div>
  )
}

export default Collections
