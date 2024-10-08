import Link from 'next/link'
import { useTranslation, Trans } from 'next-i18next'

import styles from './Library.module.scss'

const CatBanner = ({ assetType, collections }) => {
  const { t } = useTranslation('categories')

  const top_level_categories = {
    // WARNING: Duplicate of top_level_categories.json
    hdris: {
      outdoor: 'spruit_sunrise',
      skies: 'kloofendal_48d_partly_cloudy_puresky',
      indoor: 'brown_photostudio_02',
      studio: 'studio_small_03',
      'sunrise-sunset': 'the_sky_is_on_fire',
      night: 'rogland_clear_night',
      nature: 'je_gray_02',
      urban: 'canary_wharf',
    },
    textures: {
      aerial: 'rocky_terrain_02',
      terrain: 'brown_mud_leaves_01',
      floor: 'marble_01',
      brick: 'red_brick_03',
      wood: 'oak_veneer_01',
      'plaster-concrete': 'concrete_layers_02',
      fabric: 'denim_fabric',
      metal: 'corrugated_iron_02',
      roofing: 'clay_roof_tiles_02',
      rock: 'dry_riverbed_rock',
    },
    models: {
      props: 'Camera_01',
      furniture: 'modern_arm_chair_01',
      decorative: 'carved_wooden_elephant',
      industrial: 'utility_box_02',
      appliances: 'boombox',
      nature: 'jacaranda_tree',
      electronics: 'Television_01',
      tools: 'Drill_01',
      lighting: 'desk_lamp_arm_01',
    },
  }

  return (
    <div className={styles.catBannerWrapper}>
      <h2>{assetType === 'all' ? 'Collections:' : 'Categories:'}</h2>
      <div className={styles.catBannerFlex}>
        {assetType === 'all'
          ? Object.keys(collections).map((collectionID, i) => (
              <Link key={i} href={`/collections/${collectionID}`} className={`${styles.cat}`}>
                <img src={`https://cdn.polyhaven.com/collections/${collectionID}.png?width=578&aspect_ratio=16:9`} />
                <p>{collections[collectionID]}</p>
              </Link>
            ))
          : Object.keys(top_level_categories[assetType]).map((category, i) => {
              const imgUrl = {
                hdris: `https://cdn.polyhaven.com/asset_img/primary/${top_level_categories[assetType][category]}.png?aspect_ratio=1:1&height=180`,
                textures: `https://cdn.polyhaven.com/asset_img/primary/${top_level_categories[assetType][category]}.png?aspect_ratio=1:1&height=180`,
                models: `https://cdn.polyhaven.com/asset_img/primary/${top_level_categories[assetType][category]}.png?height=180&width=180`,
              }
              return (
                <Link
                  key={i}
                  href={`/${assetType}/${category}`}
                  className={`${styles.cat} ${assetType === 'models' ? styles.modelCat : ''}`}
                >
                  <img src={imgUrl[assetType]} />
                  <p>{t(category)}</p>
                </Link>
              )
            })}
      </div>
    </div>
  )
}

export default CatBanner
