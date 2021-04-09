import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';

import styles from './Library.module.scss';

const Library = (props) => {

  return (
    <div id={styles.library}>
      <Sidebar assetType={props.assetType} categories={props.categories} />
      <Grid assetType={props.assetType} categories={props.categories} />
    </div>
  );
}

export default Library;