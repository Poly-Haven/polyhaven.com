import Link from 'next/link'

import styles from './GridItem.module.scss';

const GridItem = ({ asset, assetID }) => {
  return (
    <Link href="/a/[id]" as={`/a/${assetID}`}><a className={styles.gridItem}>
      <div>
        {asset.name}
      </div>
    </a></Link>
  );
}

export default GridItem;