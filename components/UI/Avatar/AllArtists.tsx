import Link from 'next/link';
import { stringHash } from 'utils/stringUtils'

import Heart from 'components/UI/Icons/Heart'

import Tooltip from '../Tooltip/Tooltip';

import styles from './AllArtists.module.scss'

const placeholderAvatar = (name) => {
  // Random colors from material design
  const colorSet = [
    'ef5350',
    'ec407a',
    'ab47bc',
    '7e57c2',
    '5c6bc0',
    '42a5f5',
    '29b6f6',
    '26c6da',
    '26a69a',
    '66bb6a',
    '9ccc65',
    'd4e157',
    'ffee58',
    'ffca28',
    'ffa726',
    'ff7043',
    '8d6e63',
    'bdbdbd',
    '78909c',
  ]
  return `https://ui-avatars.com/api/?name=${name}&size=50&background=${colorSet[Math.abs(stringHash(name) % colorSet.length)]}`
}

const AllArtists = ({ data }) => {

  let authors = Object.keys(data)
  authors.sort((a, b) => data[a].name.localeCompare(data[b].name));
  authors.sort((a, b) => data[b].assetCount - data[a].assetCount);

  return (
    <div className={styles.allArtists}>
      {authors.map(author => <Link key={author} href={`/all?a=${author}`} prefetch={false}>
        <a
          data-tip={`${author} (${data[author].assetCount} ${data[author].assetCount === 1 ? 'asset' : 'assets'})`}
          data-for="allAssets"
          className={styles.avatar}
        >
          <img
            src={`https://cdn.polyhaven.com/people/${author}.jpg?width=50`}
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src = placeholderAvatar(author)
            }}
          />
          {data[author].regular_donor ?
            <div className={styles.regularDonor} data-tip="Regular asset donor" data-for="allAssets"><Heart color="#F96854" /></div>
            : null}
        </a></Link>)
      }
      <Tooltip id="allAssets" />
    </div >
  )
}

export default AllArtists