import { useState } from 'react'

import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';
import Page from 'components/Layout/Page/Page'

import styles from './Library.module.scss';

const Library = (props) => {
  const [sort, setSort] = useState('hot')
  const [search, setSearch] = useState()

  return (
    <div id={styles.library}>
      <Sidebar assetType={props.assetType} categories={props.categories} />
      <Page>
        <Grid
          assetType={props.assetType}
          categories={props.categories}
          sort={sort}
          setSort={setSort}
          search={search}
          setSearch={setSearch}
        />
      </Page>
    </div>
  );
}

export default Library;