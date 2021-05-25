import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import Patron from 'components/Avatar/Patron'
import Spinner from 'components/Spinner/Spinner'

const LatestPatrons = () => {
  let { data, error } = useSWR(`https://api.polyhaven.com/patrons_latest`, fetcher, { revalidateOnFocus: false });
  if (error) return <div />
  if (!data) {
    return (<Spinner />)
  }

  return (
    <>
      {data.map(p => <Patron key={p[0]} name={p[1]} image={`https://c8.patreon.com/2/36/${p[0]}`} size={36} timestamp={p[2]} />)}
    </>
  )
}

export default LatestPatrons
