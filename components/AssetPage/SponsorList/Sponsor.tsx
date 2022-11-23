import apiSWR from 'utils/apiSWR'
import Loader from 'components/UI/Loader/Loader'

import styles from '../AssetPage.module.scss'

const Sponsor = ({ id }) => {
  const { data, error } = apiSWR(`/sponsor/${id}`, { revalidateOnFocus: false })
  if (!data || error) return <Loader />
  return (
    <p>
      {data.url ? (
        <a href={data.url} rel="nofollow noopener">
          {data.logo ? (
            <img
              src={`https://cdn.polyhaven.com/corporate_sponsors/${data.logo}`}
              alt={data.name}
              title={data.name}
              className={styles.corpSponsor}
            />
          ) : (
            data.name
          )}
        </a>
      ) : (
        data.name
      )}
    </p>
  )
}

export default Sponsor
