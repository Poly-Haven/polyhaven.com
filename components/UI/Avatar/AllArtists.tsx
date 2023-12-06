import { useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import Heart from 'components/UI/Icons/Heart'
const Avatar = dynamic(() => import('components/UI/Avatar/Avatar'), { ssr: false })

import Tooltip from '../Tooltip/Tooltip'

import styles from './AllArtists.module.scss'

const AllArtists = ({ data }) => {
  let authors = Object.keys(data)
  authors.sort((a, b) => data[a].name.localeCompare(data[b].name))
  authors.sort((a, b) => data[b].assetCount - data[a].assetCount)

  // Remove authors with less than {threshold} assets if not showing all
  const [showAll, setShowAll] = useState(false)
  const threshold = 2
  if (!showAll) authors = authors.filter((author) => data[author].assetCount >= threshold)
  const numFiltered = Object.keys(data).length - authors.length

  return (
    <div className={styles.allArtists}>
      {authors.map((author) => (
        <Link
          key={author}
          href={`/all?a=${author}`}
          prefetch={false}
          data-tip={`${author} (${data[author].assetCount} ${data[author].assetCount === 1 ? 'asset' : 'assets'})`}
          data-for="allAssets"
          className={styles.avatar}
        >
          <Avatar id={author} size={50} />
          {data[author].regular_donor ? (
            <div className={styles.regularDonor} data-tip="Regular asset donor" data-for="allAssets">
              <Heart color="#F96854" />
            </div>
          ) : null}
        </Link>
      ))}
      {!showAll ? (
        <p data-tip={`+${numFiltered} more authors with less than ${threshold} assets each`} data-for="allAssets">
          <a style={{ margin: '0.5em', cursor: 'pointer' }} onClick={() => setShowAll(true)}>
            +{numFiltered} more
          </a>
        </p>
      ) : null}
      <Tooltip id="allAssets" />
    </div>
  )
}

export default AllArtists
