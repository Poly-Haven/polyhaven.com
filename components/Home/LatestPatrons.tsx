import Patron from 'components/UI/Avatar/Patron'
import Spinner from 'components/UI/Spinner/Spinner'

import apiSWR from 'utils/apiSWR'

const LatestPatrons = ({ mode }) => {
  let { data, error } = apiSWR(`/patrons_${mode}`, { revalidateOnFocus: false })
  if (error) return <div />
  if (!data) {
    return <Spinner />
  }

  return (
    <>
      {data.map((p) => (
        <Patron key={p[0]} name={p[1]} size={36} timestamp={p[2]} />
      ))}
    </>
  )
}

LatestPatrons.defaultProps = {
  mode: 'latest',
}

export default LatestPatrons
