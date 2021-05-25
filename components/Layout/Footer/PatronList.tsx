import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import Spinner from 'components/Spinner/Spinner'

import styles from './Footer.module.scss';

const PatronList = () => {
  let { data, error } = useSWR(`https://api.polyhaven.com/patrons`, fetcher, { revalidateOnFocus: false });
  if (error) return <div>Failed to fetch list of patrons :(</div>
  if (!data) {
    return (<Spinner />)
  }

  return (
    <>
      {data.map((p, i) => <p key={i} className={styles[`patron-rank-${p[1]}`]}>{p[0]}</p>)}
    </>
  )
}

export default PatronList
