import { useEffect, useState } from 'react'

import apiSWR from 'utils/apiSWR'
import asset_types from 'constants/asset_types.json'
import Fuse from 'fuse.js'
import useQuery from 'hooks/useQuery'

import Spinner from 'components/UI/Spinner/Spinner'

import styles from './SlugCheck.module.scss'

const AssetList = ({ arr, assetList, search }) => {
  return (
    <div className={styles.assetList}>
      {arr.length ? (
        arr.slice(0, 30).map((key) => (
          <a
            key={key}
            className={`${styles.slug} ${styles[Object.keys(asset_types)[assetList[key]['type']]]} ${
              key.toLowerCase() === search.toLowerCase() ? styles.match : ''
            }`}
            href={`https://polyhaven.com/a/${key}`}
          >
            <span className={styles.thumb}>
              <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${key}.png?width=64&height=64&quality=95`} />
            </span>
            {key}
          </a>
        ))
      ) : (
        <p>✅ No matches</p>
      )}
    </div>
  )
}

const SlugCheck = () => {
  const [assetList, setAssetList] = useState()
  const [startsWith, setStartsWith] = useState([])
  const [looseMatch, setLooseMatch] = useState([])
  const [search, setSearch] = useState('')
  const query = useQuery()

  useEffect(() => {
    if (query.s) setSearch(query.s as string)
  }, [query])

  let { data: assets, error: assetsError } = apiSWR(`/assets?future=true`, { revalidateOnFocus: true })
  if (!assetList && assets && !assetsError) {
    setAssetList(assets)
  }

  useEffect(() => {
    if (!assetList) return
    const sw = Object.keys(assetList)
      .filter((a) => a.toLowerCase().startsWith(search.toLowerCase()))
      .sort(
        (a, b) =>
          new Date(assetList[b]['date_published']).getTime() - new Date(assetList[a]['date_published']).getTime()
      )
    setStartsWith(sw)
    setLooseMatch((_) => {
      const fuse = new Fuse(Object.keys(assetList), {
        threshold: 0.3,
      })
      return fuse
        .search(search)
        .map((a) => a.item)
        .filter((a) => !sw.includes(a))
        .sort(
          (a, b) =>
            new Date(assetList[b]['date_published']).getTime() - new Date(assetList[a]['date_published']).getTime()
        )
    })
  }, [search, assetList])

  return (
    <div className={styles.wrapper}>
      <h1>Slug Checker</h1>
      <p>Check if there's an existing asset with a certian slug already.</p>
      <input
        id={'search'}
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value.toLowerCase().replace(/ /g, '_'))}
        placeholder={'Search...'}
      />
      {assetList ? (
        <>
          <AssetList arr={startsWith} assetList={assetList} search={search} />
          {looseMatch.length ? (
            <>
              <hr />
              <h2>Similar:</h2>
              <AssetList arr={looseMatch} assetList={assetList} search={search} />
            </>
          ) : null}
        </>
      ) : (
        <Spinner />
      )}
    </div>
  )
}

export default SlugCheck
