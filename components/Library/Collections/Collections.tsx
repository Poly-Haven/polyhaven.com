import { useTranslation } from 'next-i18next'
import Link from 'next/link'

import Heart from 'components/UI/Icons/Heart'
import Button from 'components/UI/Button/Button'

import styles from './Collections.module.scss'

const Collections = () => {
  const { t } = useTranslation(['common', 'collections'])

  return (
    <div className={styles.wrapper}>
      <h1>Poly Haven Collections</h1>
      <p>{t('collections:description')}</p>
      <div className={styles.collectionsList}>
        <Link href="/all?s=collection: smuggler's cove&strict=true">
          <a className={styles.collection}>
            <div className={styles.collectionInner}>
              <img src="https://cdn.polyhaven.com/collections/smugglers-cove.png?width=580" alt="The Smuggler's Cove" />
              <div className={styles.row}>
                <div className={`${styles.col} ${styles.alignLeft}`}>
                  <h2>The Smuggler's Cove</h2>
                  <p>Brief description goes here!</p>
                </div>
                <div className={`${styles.col} ${styles.alignRight}`}>
                  <p>
                    <Link href="/models?s=collection: smuggler's cove&strict=true">
                      <a>XX models</a>
                    </Link>
                  </p>
                  <p>
                    <Link href="/textures?s=collection: smuggler's cove&strict=true">
                      <a>YY textures</a>
                    </Link>
                  </p>
                </div>
              </div>
              <div className={styles.row}>
                <Button text="Download Scene File" href="#" />
                <p>[array of asset thumbnails]</p>
              </div>
            </div>
          </a>
        </Link>
        <Link href="/all?s=collection: shed&strict=true">
          <a className={styles.collection}>
            <div className={styles.collectionInner}>
              <img src="https://cdn.polyhaven.com/collections/the-shed.png?width=580" alt="The Shed" />
              <div className={styles.banner}>
                <div className={styles.bannerInner}>
                  <Heart /> Community Project
                </div>
              </div>
              <div className={styles.row}>
                <div className={`${styles.col} ${styles.alignLeft}`}>
                  <h2>The Shed</h2>
                  <p>Brief description goes here!</p>
                </div>
                <div className={`${styles.col} ${styles.alignRight}`}>
                  <p>
                    <Link href="/models?s=collection: shed&strict=true">
                      <a>XX models</a>
                    </Link>
                  </p>
                  <p>
                    <Link href="/textures?s=collection: shed&strict=true">
                      <a>YY textures</a>
                    </Link>
                  </p>
                </div>
              </div>
              <div className={styles.row}>
                <Button text="Download Scene File" href="#" />
                <p>[array of asset thumbnails]</p>
              </div>
            </div>
          </a>
        </Link>
        <Link href="/all?s=collection: mountain pines&strict=true">
          <a className={styles.collection}>
            <div className={styles.collectionInner}>
              <img src="https://cdn.polyhaven.com/collections/mountain-pines.png?width=580" alt="Mountain Pines" />
              <div className={styles.row}>
                <div className={`${styles.col} ${styles.alignLeft}`}>
                  <h2>Mountain Pines</h2>
                  <p>Brief description goes here!</p>
                </div>
                <div className={`${styles.col} ${styles.alignRight}`}>
                  <p>
                    <Link href="/models?s=collection: mountain pines&strict=true">
                      <a>XX models</a>
                    </Link>
                  </p>
                  <p>
                    <Link href="/textures?s=collection: mountain pines&strict=true">
                      <a>YY textures</a>
                    </Link>
                  </p>
                </div>
              </div>
              <div className={styles.row}>
                <Button text="Download Scene File" href="#" />
                <p>[array of asset thumbnails]</p>
              </div>
            </div>
          </a>
        </Link>
      </div>
    </div>
  )
}

export default Collections
