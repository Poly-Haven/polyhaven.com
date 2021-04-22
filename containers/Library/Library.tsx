import { useState } from 'react'

import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';
import Page from 'components/Layout/Page/Page'

import styles from './Library.module.scss';

const Library = (props) => {
  const [sort, setSort] = useState('hot')

  return (
    <div id={styles.library}>
      <Sidebar assetType={props.assetType} categories={props.categories} />
      <Page>
        <Grid
          assetType={props.assetType}
          categories={props.categories}
          sort={sort}
          setSort={setSort}
        />
      </Page>
    </div>
  );
}

export default Library;