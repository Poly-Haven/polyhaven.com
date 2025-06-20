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

  const collectionLink = `/collections/${collectionId}`

  const buttonStyle = { whiteSpace: 'nowrap', margin: 0, padding: '0.5em 0.8em', width: 'calc(100% - 2em - 2px)' }

  return (
    <div className={styles.collection}>
      <div className={styles.collectionInner}>
        <Link href={collectionLink}>
          <img
            src={`https://cdn.polyhaven.com/collections/${collectionId}.png?width=578&aspect_ratio=16:9&quality=95`}
            alt={`${data.name}`}
          />
        </Link>
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
          <div className={styles.buttonCol}>
            <Button text="View Assets" href={collectionLink} style={buttonStyle} />
            {data.scene && (
              <>
                {Object.keys(data.scene).map((software, i) => (
                  <Button
                    text={software === 'unreal' ? 'Unreal Project' : 'Scene File'}
                    href={data.scene[software]}
                    icon={softwareIcons[software]}
                    style={buttonStyle}
                    color="hollow"
                    key={i}
                  />
                ))}
              </>
            )}
          </div>
        </div>

        <div className={styles.assetList}>
          {data.assets.map((slug) => (
            <Link href="/a/[id]" as={`/a/${slug}`} className={styles.asset} key={slug}>
              <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=192&height=64&quality=95`} />
            </Link>
          ))}
          <Link href={collectionLink} className={styles.arrow}>
            <MdArrowForward />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Collection
