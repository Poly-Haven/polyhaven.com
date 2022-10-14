import Link from 'next/link';
import apiSWR from 'utils/apiSWR'

import Spinner from '../Spinner/Spinner';

import styles from './Avatar.module.scss'

const AllArtists = () => {
  const { data, error } = apiSWR(`/authors`, { revalidateOnFocus: false });
  if (error || !data) {
    return <Spinner />
  }

  let authors = Object.keys(data)
  authors.sort((a, b) => data[a].name.localeCompare(data[b].name));
  authors.sort((a, b) => data[b].assetCount - data[a].assetCount);

  return (
    <div className={styles.allArtists}>
      {authors.map(author => <Link key={author} href={`/all?a=${author}`}><a data-tip={`${author} (${data[author].assetCount} ${data[author].assetCount === 1 ? 'asset' : 'assets'})`}>
        <img
          className={styles.avatar}
          src={`https://cdn.polyhaven.com/people/${author}.jpg?width=50`}
          onError={e => {
            const target = e.target as HTMLImageElement;
            target.src = `https://cdn.polyhaven.com/people/fallback.png?width=50`
          }}
        />
      </a></Link>)
      }
    </div >
  )
}

export default AllArtists