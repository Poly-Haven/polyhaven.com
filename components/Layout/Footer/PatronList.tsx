import Spinner from 'components/Spinner/Spinner'

import apiSWR from 'utils/apiSWR'

import styles from './Footer.module.scss';

const PatronList = () => {
  let { data, error } = apiSWR(`/patrons`, { revalidateOnFocus: false });
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
