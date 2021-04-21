import Link from 'next/link'

import { LazyLoadImage } from 'react-lazy-load-image-component';

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
      <span className={styles.thumb}><LazyLoadImage
        src={img_src}
        alt={asset.name}
        scrollPosition={scrollPosition}
      /></span>
    </a></Link>
  );
}

export default GridItem;