import { useTranslation } from 'next-i18next'
import { useRef } from 'react'
import Link from 'next/link'
import { timeago } from 'utils/dateUtils'

import { MdCollections } from 'react-icons/md'
import { TbBone, TbDrone } from 'react-icons/tb'

import { daysOld } from 'utils/dateUtils'
import IconPatreon from 'components/UI/Icons/Patreon'
import SimpleAuthorCredit from 'components/Library/Grid/SimpleAuthorCredit'

import styles from './GridItem.module.scss'

const GridItem = ({ asset, assetID, onClick, blurUpcoming, thumbSize }) => {
  const { t: tt } = useTranslation('time')
  const { t } = useTranslation('library')

  const imgRef = useRef(null)
  const wrapperRef = useRef(null)

  const sizes = {
    hdris: {
      small: [230, 172],
      medium: [371, 278],
      large: [510, 382],
      huge: [790, 592],
    },
    textures: {
      small: [188, 188],
      medium: [284, 284],
      large: [368, 368],
      huge: [506, 506],
    },
    models: {
      small: [450 * 0.66, 300 * 0.66],
      medium: [450, 300],
      large: [450 * 1.3, 300 * 1.3],
      huge: [450 * 1.78, 300 * 1.78],
    },
  }
  const size = Object.values(sizes)[asset.type][thumbSize]

  const blur = blurUpcoming && daysOld(asset.date_published) < 0

  let badge
  if (daysOld(asset.date_published) < 0) {
    badge = {
      text: (
        <>
          <IconPatreon />
          {t('early-access')}
        </>
      ),
      style: styles.soon,
      tooltip: t('$3+ Patrons can log in to download early'),
    }
  } else if (daysOld(asset.date_published) < 7) {
    badge = {
      text: t('new'),
      style: styles.new,
    }
  }

  let indicators = []
  if (asset.backplates) {
    indicators.push({
      text: `✔ Backplates: ${t('backplates')}`,
      icon: <MdCollections />,
    })
  }
  if (asset.categories.includes('rigged')) {
    indicators.push({
      text: `✔ Rigged: ${t('rigged')}`,
      icon: <TbBone />,
    })
  }
  if (asset.categories.includes('aerial')) {
    indicators.push({
      text: `✔ Aerial: ${t('aerial')}`,
      icon: <TbDrone />,
    })
  }

  let creditedAuthors = []
  for (const [author, credit] of Object.entries(asset.authors)) {
    if (credit === 'All') {
      creditedAuthors.push(author)
    }
  }
  if (creditedAuthors.length === 0) {
    creditedAuthors = Object.keys(asset.authors)
  }

  const img_src = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=${size[0]}&height=${size[1]}`
  return (
    <Link href="/a/[id]" as={`/a/${assetID}`}>
      <a className={`${styles.gridItem} ${blur ? styles.blur : ''}`} onClick={onClick} ref={wrapperRef}>
        <div className={styles.author}>
          <div className={styles.authorInner}>
            {creditedAuthors.sort().map((a) => (
              <SimpleAuthorCredit key={a} id={a} donated={asset.donated} short={creditedAuthors.length > 1} />
            ))}
          </div>
        </div>
        <div className={styles.thumb}>
          <img src={img_src} alt={asset.name} ref={imgRef} />
        </div>
        <div className={styles.text}>
          <h3>{asset.name}</h3>
          <p>{timeago(asset.date_published * 1000, tt)}</p>
        </div>
        {badge ? (
          <div className={`${styles.badge} ${badge.style}`} title={badge.tooltip}>
            {badge.text}
          </div>
        ) : null}
        <div className={styles.indicators}>
          {indicators.map((i) => (
            <div key={i.text} title={i.text} className={styles.indicator}>
              {i.icon}
            </div>
          ))}
        </div>
      </a>
    </Link>
  )
}

GridItem.defaultProps = {
  onClick: null,
  blurUpcoming: true,
  thumbSize: 'medium',
}

export default GridItem
