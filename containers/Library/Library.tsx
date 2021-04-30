import { useState } from 'react'

import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';
import Page from 'components/Layout/Page/Page'

import styles from './Library.module.scss';

const Library = ({ assetType, categories }) => {
  const [sort, setSort] = useState('hot')
  const [search, setSearch] = useState()

  return (
    <div id={styles.library}>
      <Sidebar assetType={assetType} categories={categories} />
      <Page>
        <Grid
          assetType={assetType}
          categories={categories}
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