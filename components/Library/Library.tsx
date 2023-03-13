import { useCallback, useState, useEffect } from 'react'

import Sidebar from 'components/Library/Sidebar/Sidebar'
import Grid from 'components/Library/Grid/Grid'
import Page from 'components/Layout/Page/Page'
import debounce from 'lodash.debounce'

import styles from './Library.module.scss'

const Library = ({ assetType, categories, author, search, strictSearch, sort }) => {
  const [authorState, setAuthor] = useState(author)
  const [searchState, setSearch] = useState(search)
  const [strictSearchState, setStrictSearch] = useState(strictSearch)
  const [sortState, setSort] = useState(sort)

  const setSearchDebounced = useCallback(
    debounce((newSearchText) => {
      setSearch(newSearchText)
      if (strictSearchState) setStrictSearch(false)
    }, 300),
    []
  )

  useEffect(() => {
    document.getElementById('page').scrollTop = 0
  })

  return (
    <div id={styles.library}>
      <Sidebar assetType={assetType} categories={categories} />
      <Page library>
        <Grid
          assetType={assetType}
          categories={categories}
          author={authorState}
          setAuthor={setAuthor}
          search={searchState}
          setSearchDebounced={setSearchDebounced}
          strictSearch={strictSearchState}
          setStrictSearch={setStrictSearch}
          sort={sortState}
          setSort={setSort}
        />
      </Page>
    </div>
  )
}

export default Library
