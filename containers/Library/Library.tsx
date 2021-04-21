import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';
import Page from 'components/Page/Page'

import styles from './Library.module.scss';

const Library = (props) => {

  return (
    <div id={styles.library}>
      <Sidebar assetType={props.assetType} categories={props.categories} />
      <Page>
        <Grid assetType={props.assetType} categories={props.categories} />
      </Page>
    </div>
  );
}

export default Library;