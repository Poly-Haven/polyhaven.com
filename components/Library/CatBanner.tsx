import Link from 'next/link'
import { useTranslation } from 'next-i18next'

import { getRoots, categoryLabel } from 'utils/taxonomy'
import bannerAssets from 'constants/categoryBannerAssets.json'

import styles from './Library.module.scss'

/**
 * The landing-page grid of top-level categories (or collections on /all).
 *
 * Category tiles come straight from the taxonomy, so adding or renaming a top-level category
 * needs no change here. Each tile's image is a representative asset from that category
 * (constants/categoryBannerAssets.json - regenerate if a category ends up empty).
 */
const CatBanner = ({ assetType, collections }) => {
  const { t } = useTranslation('categories')

  if (assetType === 'all') {
    return (
      <div className={styles.catBannerWrapper}>
        <h2>Collections:</h2>
        <div className={styles.catBannerFlex} style={{ flexWrap: 'nowrap' }}>
          {Object.keys(collections).map((collectionID, i) => (
            <Link key={i} href={`/collections/${collectionID}`} className={`${styles.cat}`}>
              <img
                src={`https://cdn.polyhaven.com/collections/${collectionID}.png?width=578&aspect_ratio=16:9&quality=95`}
              />
              <p>{collections[collectionID]}</p>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  const images = bannerAssets[assetType] || {}
  // A category with no representative asset has nothing published in it yet.
  const roots = getRoots(assetType).filter((node) => images[node.slug])

  return (
    <div className={styles.catBannerWrapper}>
      <h2>Categories:</h2>
      <div className={styles.catBannerFlex}>
        {roots.map((node) => {
          const slug = images[node.slug]
          const imgUrl =
            assetType === 'models'
              ? `https://cdn.polyhaven.com/asset_img/primary/${slug}.png?height=180&quality=95`
              : `https://cdn.polyhaven.com/asset_img/primary/${slug}.png?aspect_ratio=1:1&height=180&quality=95`
          return (
            <Link
              key={node.path}
              href={`/${assetType}/${node.slugPath}`}
              title={node.description || undefined}
              className={`${styles.cat} ${assetType === 'models' ? styles.modelCat : ''}`}
            >
              <img src={imgUrl} />
              <p>{categoryLabel(t, node)}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default CatBanner
