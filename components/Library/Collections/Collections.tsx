import { useTranslation } from 'next-i18next'
import Link from 'next/link'

import Heart from 'components/UI/Icons/Heart'
import Button from 'components/UI/Button/Button'
import Collection from './Collection'

import styles from './Collections.module.scss'

const Collections = ({ collections }) => {
  const { t } = useTranslation(['common', 'collections'])

  return (
    <div className={styles.wrapper}>
      <h1>Poly Haven Collections</h1>
      <p>{t('collections:description')}</p>
      <div className={styles.collectionsList}>
        {Object.keys(collections).map((collectionId) => (
          <Collection collectionId={collectionId} key={collectionId} data={collections[collectionId]} />
        ))}
      </div>
    </div>
  )
}

export default Collections
