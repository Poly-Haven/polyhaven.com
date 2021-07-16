import apiSWR from 'utils/apiSWR'

import Spinner from 'components/Spinner/Spinner'
import Gallery from 'components/Gallery/Gallery'

import styles from './AssetPage.module.scss'

const UserRenders = ({ assetID }) => {
  const { data, error } = apiSWR(`/gallery?assetID=${assetID}`, { revalidateOnFocus: false });
  if (error) {
    return null
  } else if (!data) {
    return <div className={styles.userRenders}>
      <h1>User Renders:</h1>
      <Spinner />
    </div>
  }

  if (!data.length) return null

  return (
    <div className={styles.userRenders}>
      <h1>User Renders:</h1>
      <Gallery data={data} assetPage={true} />
    </div>
  )
}

export default UserRenders
