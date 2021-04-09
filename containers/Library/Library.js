import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';

import styles from './Library.module.scss';

const Library = (props) => {
  const assetType = props.assetType

  return (
    <div id={styles.library}>
      <Sidebar assetType={assetType} />
      <Grid assetType={assetType} />
    </div>
  );
}

export default Library;