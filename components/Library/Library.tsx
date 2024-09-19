import { useCallback, useState, useEffect } from 'react'
import useStoredState from 'hooks/useStoredState'
import debounce from 'lodash.debounce'
import { v4 as uuid } from 'uuid'

import Sidebar from 'components/Library/Sidebar/Sidebar'
import Grid from 'components/Library/Grid/Grid'
import Page from 'components/Layout/Page/Page'
import CollectionHeader from 'components/Library/Collections/CollectionHeader'
import CatBanner from 'components/Library/CatBanner'

import styles from './Library.module.scss'

const Library = ({ assetType, collections, collection, categories, author, search, strictSearch, sort }) => {
  const [authorState, setAuthor] = useState(author)
  const [searchState, setSearch] = useState(search)
  const [strictSearchState, setStrictSearch] = useState(strictSearch)
  const [sortState, setSort] = useStoredState('library_sort', sort)
  const [libSessionID, _] = useState(uuid()) // Anonymous session ID used to help determine synonyms in search tracking

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

  // Show banner if no category or collection is selected
  const banner = !categories.length && !collection

  return (
    <div id={styles.library}>
      <Sidebar assetType={assetType} categories={categories} />
      <Page library>
        {collection ? <CollectionHeader collection={collection} /> : null}
        {banner ? <CatBanner assetType={assetType} collections={collections} /> : null}
        <Grid
          assetType={assetType}
          categories={categories}
          banner={banner}
          collection={collection}
          author={authorState}
          setAuthor={setAuthor}
          search={searchState}
          setSearchDebounced={setSearchDebounced}
          strictSearch={strictSearchState}
          setStrictSearch={setStrictSearch}
          sort={sortState}
          setSort={setSort}
          libSessionID={libSessionID}
        />
      </Page>
    </div>
  )
}

export default Library
