import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'
import Blender from 'components/UI/Icons/Blender'
import Unreal from 'components/UI/Icons/Unreal'

import { MdArrowForward } from 'react-icons/md'

import styles from './Collections.module.scss'

const Collection = ({ collectionId, data }) => {
  const softwareIcons = {
    blender: <Blender />,
    unreal: <Unreal />,
  }

  return (
    <Link href={`/all?s=collection: ${collectionId}&strict=true`}>
      <a className={styles.collection}>
        <div className={styles.collectionInner}>
          <img src={`https://cdn.polyhaven.com/collections/${collectionId}.png?width=580`} alt={`${data.name}`} />
          {data.community && (
            <div className={styles.banner}>
              <div className={styles.bannerInner}>
                <Heart /> Community Project
              </div>
            </div>
          )}

          <div className={styles.row}>
            <div className={`${styles.col} ${styles.alignLeft}`}>
              <h2>{data.name}</h2>
              <p>{data.description}</p>
            </div>
            {data.scene && (
              <div>
                {Object.keys(data.scene).map((software) => (
                  <Button
                    text="Download Scene File"
                    href={data.scene[software]}
                    icon={softwareIcons[software]}
                    style={{ whiteSpace: 'nowrap' }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.assetList}>
            {data.assets.map((slug) => (
              <Link href="/a/[id]" as={`/a/${slug}`}>
                <a className={styles.asset}>
                  <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=64&height=64 `} />
                </a>
              </Link>
            ))}
            <div className={styles.arrow}>
              <MdArrowForward />
            </div>
          </div>
        </div>
      </a>
    </Link>
  )
}

export default Collection
