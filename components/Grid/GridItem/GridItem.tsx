import Link from 'next/link'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import timeago from 'epoch-timeago';

import { daysOld } from 'utils/dateUtils'

import styles from './GridItem.module.scss';

const GridItem = ({ asset, assetID, scrollPosition }) => {
  const ext = {
    0: 'jpg',
    1: 'png',
    2: 'png'
  }
  const img_src = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.${ext[asset.type]}?width=379&sharpen=true`
  return (
    <Link href="/a/[id]" as={`/a/${assetID}`}><a className={styles.gridItem}>
      <div className={styles.thumb}><LazyLoadImage
        src={img_src}
        alt={asset.name}
        scrollPosition={scrollPosition}
        placeholder={<div className={styles.skelly}></div>}
      /></div>
      <div className={styles.text}>
        <h3>{asset.name}</h3>
        <p>{timeago(asset.date_published * 1000)}</p>
      </div>
      {daysOld(asset.date_published) < 7 ? <div className={styles.new}>New!</div> : null}
    </a></Link>
  );
}

export default GridItem;