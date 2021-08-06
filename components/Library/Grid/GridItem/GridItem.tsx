import Link from 'next/link'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { timeago } from 'utils/dateUtils';

import { daysOld } from 'utils/dateUtils'
import IconPatreon from 'components/UI/Icons/Patreon'

import styles from './GridItem.module.scss';

const GridItem = ({ asset, assetID, onClick, scrollPosition }) => {

  let size = [371, 278];
  if (asset.type === 1) {
    size = [285, 285]
  } else if (asset.type === 2) {
    size = [450, 300]
  }

  let badge;
  if (daysOld(asset.date_published) < 0) {
    badge = {
      text: <><IconPatreon />Early<br />Access</>,
      style: styles.soon
    }
  } else if (daysOld(asset.date_published) < 7) {
    badge = {
      text: "New!",
      style: styles.new
    }
  }

  const img_src = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=${size[0]}&height=${size[1]}`
  return (
    <Link href="/a/[id]" as={`/a/${assetID}`}><a className={styles.gridItem} onClick={onClick}>
      <div className={styles.thumb}><LazyLoadImage
        src={img_src}
        alt={asset.name}
        scrollPosition={scrollPosition}
        threshold={500}
        placeholder={<div className={styles.skelly}></div>}
      /></div>
      <div className={styles.text}>
        <h3>{asset.name}</h3>
        <p>{timeago(asset.date_published * 1000)}</p>
      </div>
      {badge ? <div className={`${styles.badge} ${badge.style}`}>{badge.text}</div> : null}
    </a></Link>
  );
}

GridItem.defaultProps = {
  onClick: null
}

export default GridItem;