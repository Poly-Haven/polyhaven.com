import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/router'
import useStoredState from 'hooks/useStoredState'
import debounce from 'lodash.debounce'
import { v4 as uuid } from 'uuid'
import apiSWR from 'utils/apiSWR'
import { attributeFiltersFromQuery } from 'utils/assetFiltering'
import { setQueryShallow } from 'utils/shallowQuery'

import Sidebar from 'components/Library/Sidebar/Sidebar'
import Grid from 'components/Library/Grid/Grid'
import Page from 'components/Layout/Page/Page'
import CollectionHeader from 'components/Library/Collections/CollectionHeader'
import VaultBanner from 'components/Vaults/VaultBanner'
import CatBanner from 'components/Library/CatBanner'

import styles from './Library.module.scss'

const Library = ({ assetType, collections, collection, vault, categoryPath, author, search, strictSearch, sort }) => {
  const router = useRouter()
  // Attribute facets and the search term live in the query string (e.g. ?weather=clear&s=brick)
  // so they're shareable and survive a reload.
  const attributes = useMemo(() => attributeFiltersFromQuery(router.query || {}, assetType), [router.query, assetType])
  const searchState = typeof router.query.s === 'string' ? router.query.s : search
  // The author filter keeps its long-standing ?a= param, so existing links to an author's work
  // still work - it's just driven from the URL now instead of local state.
  const authorState = typeof router.query.a === 'string' ? router.query.a : author
  const setAuthor = (value) =>
    setQueryShallow(router, (query) => {
      if (value) query.a = value
      else delete query.a
    })
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

  // The debounced callback is created once, so keep a ref to the current router rather than
  // capturing a stale one.
  const routerRef = useRef(router)
  useEffect(() => {
    routerRef.current = router
  }, [router])

  const setSearchDebounced = useCallback(
    debounce((newSearchText) => {
      // `replace` rather than `push` so typing doesn't fill the history with an entry per pause.
      setQueryShallow(
        routerRef.current,
        (query) => {
          delete query.strict // a new term drops exact-tag-match mode, so drop it from the URL too
          if (newSearchText) query.s = newSearchText
          else delete query.s
        },
        { replace: true }
      )
      setStrictSearch(false)
    }, 300),
    []
  )

  useEffect(() => {
    document.getElementById('page').scrollTop = 0
  })

  // Show banner if nothing is narrowing the library down yet
  const banner = !categoryPath && !collection && !vault && !Object.keys(attributes).length

  return (
    <div id={styles.library}>
      <Sidebar
        assetType={assetType}
        categoryPath={categoryPath}
        attributes={attributes}
        author={authorState}
        collection={collection}
        vault={vault}
      />
      <Page library>
        {vault && <VaultBanner vault={vault} numPatrons={numPatrons} libraryPage={true} />}
        {collection && <CollectionHeader collection={collection} />}
        {banner ? <CatBanner assetType={assetType} collections={collections} /> : null}
        <Grid
          assetType={assetType}
          categoryPath={categoryPath}
          attributes={attributes}
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
