import { useState } from 'react'

import Sidebar from 'components/Sidebar/Sidebar';
import Grid from 'components/Grid/Grid';
import Page from 'components/Layout/Page/Page'

import styles from './Library.module.scss';

const Library = ({ assetType, categories, author, search, sort }) => {
  const [authorState, setAuthor] = useState(author)
  const [searchState, setSearch] = useState(search)
  const [sortState, setSort] = useState(sort)

  return (
    <div id={styles.library}>
      <Sidebar assetType={assetType} categories={categories} />
      <Page>
        <Grid
          assetType={assetType}
          categories={categories}
          author={authorState}
          setAuthor={setAuthor}
          search={searchState}
          setSearch={setSearch}
          sort={sortState}
          setSort={setSort}
        />
      </Page>
    </div>
  );
}

export default Library;