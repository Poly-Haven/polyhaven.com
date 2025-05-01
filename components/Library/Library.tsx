import { useCallback, useState, useEffect } from 'react'
import useStoredState from 'hooks/useStoredState'
import debounce from 'lodash.debounce'
import { v4 as uuid } from 'uuid'
import apiSWR from 'utils/apiSWR'

import Sidebar from 'components/Library/Sidebar/Sidebar'
import Grid from 'components/Library/Grid/Grid'
import Page from 'components/Layout/Page/Page'
import CollectionHeader from 'components/Library/Collections/CollectionHeader'
import VaultBanner from 'components/Vaults/VaultBanner'
import CatBanner from 'components/Library/CatBanner'

import styles from './Library.module.scss'

const Library = ({ assetType, collections, collection, vault, categories, author, search, strictSearch, sort }) => {
  const [authorState, setAuthor] = useState(author)
  const [searchState, setSearch] = useState(search)
  const [strictSearchState, setStrictSearch] = useState(strictSearch)
  const [sortState, setSort] = useStoredState('library_sort', sort)
  const [libSessionID, _] = useState(uuid()) // Anonymous session ID used to help determine synonyms in search tracking

  const [numPatrons, setNumPatrons] = useState(0)
  if (vault) {
    const { data, error } = apiSWR('/milestones', { revalidateOnFocus: true })

    useEffect(() => {
      if (data && !error) {
        setNumPatrons(data.numPatrons)
      }
    }, [data, error])
  }

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
        {vault && <VaultBanner vault={vault} numPatrons={numPatrons} libraryPage={true} />}
        {collection && <CollectionHeader collection={collection} />}
        {banner ? <CatBanner assetType={assetType} collections={collections} /> : null}
        <Grid
          assetType={assetType}
          categories={categories}
          banner={banner}
          collection={collection}
          vault={vault}
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

Library.defaultProps = {
  collections: {},
  collection: null,
  vault: null,
}

export default Library
