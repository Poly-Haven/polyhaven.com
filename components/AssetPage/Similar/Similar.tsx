import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import apiSWR from 'utils/apiSWR'
import LazyLoad from 'react-lazy-load'

import Button from 'components/UI/Button/Button'
import GridItem from 'components/Library/Grid/GridItem/GridItem'
import Loader from 'components/UI/Loader/Loader'

import styles from './Similar.module.scss'

const INITIAL = 12
const EXPANDED = 48

const Similar = ({ slug, onClick }) => {
  const { t } = useTranslation('common')
  // Which slug the expansion belongs to, not a boolean: clicking a tile in this strip routes to
  // another asset without remounting this component (same page component), and a boolean would
  // leave every subsequent asset page expanded - fetching 48 assets and 48 thumbnails for a
  // visitor who only asked for them once, on one asset.
  const [expandedFor, setExpandedFor] = useState(null)
  const expanded = expandedFor === slug

  // Two requests rather than one for 48 trimmed down: an asset document is ~800 bytes, so asking
  // for the full set up front would quadruple this payload on every asset page view to serve the
  // few people who want it. The first request carries no `num` deliberately - 12 is the route's
  // default, and the bare URL is the one admin's publish purge can reach (Cloudflare Pro purges
  // exact URLs only, so a `?num=` variant nothing purges would serve pre-publish data for days).
  const initial = apiSWR(`/similar/${slug}`, { revalidateOnFocus: false })
  const more = apiSWR(expanded ? `/similar/${slug}?num=${EXPANDED}` : null, { revalidateOnFocus: false })

  const gridRef = useRef(null)
  const moveFocus = useRef(false)

  // The button that asked for these is gone by the time they arrive, and an unmounted button takes
  // the keyboard user's place in the document with it - the next Tab would restart from the top.
  // The grid itself is the focus target rather than the first new tile: the tiles are lazy-loaded,
  // so the 13th does not exist in the DOM yet at the moment the data lands.
  useEffect(() => {
    if (!moveFocus.current || !more.data) return
    moveFocus.current = false
    if (gridRef.current) gridRef.current.focus()
  }, [more.data])

  const data = more.data || initial.data
  // Only the absence of anything to show is a loading state. Checking `initial.error` here instead
  // would hide 48 assets that already arrived because the request for the first 12 failed.
  if (!data) {
    return <Loader />
  }

  const assets = Object.keys(data)
  const loadingMore = expanded && !more.data && !more.error
  // Kept mounted while the expansion is in flight, and on failure, so a failed click is not a dead
  // end with nothing to click again. `assets.length >= INITIAL` only means the server filled the
  // page it was given - there is no count to ask it for.
  const showMore = (!expanded || loadingMore || more.error) && assets.length >= INITIAL

  return (
    <>
      <div className={styles.wrapper} ref={gridRef} tabIndex={-1}>
        {assets.map((asset) => {
          return (
            <LazyLoad key={asset} className={styles.item} offset={400}>
              <GridItem asset={data[asset]} assetID={asset} onClick={onClick} />
            </LazyLoad>
          )
        })}
      </div>
      {showMore && (
        <div className={styles.more}>
          <Button
            text={t('more')}
            onClick={() => {
              moveFocus.current = true
              // Already expanded means the last attempt failed: the SWR key is unchanged, so
              // setting the state again would not refetch. mutate() is what retries.
              if (expanded) more.mutate()
              else setExpandedFor(slug)
            }}
          />
        </div>
      )}
      {loadingMore && (
        <div className={styles.more}>
          <Loader />
        </div>
      )}
    </>
  )
}

export default Similar
