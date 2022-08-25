import Patron from 'components/UI/Avatar/Patron'
import Spinner from 'components/UI/Spinner/Spinner'

import apiSWR from 'utils/apiSWR'

const LatestPatrons = () => {
  let { data, error } = apiSWR(`/patrons_latest`, { revalidateOnFocus: false });
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
