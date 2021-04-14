import styles from './GridItem.module.scss';

const GridItem = ({ asset, assetID }) => {
  return (
    <div className={styles.gridItem}>
      {asset.name}
    </div>
  );
}

export default GridItem;