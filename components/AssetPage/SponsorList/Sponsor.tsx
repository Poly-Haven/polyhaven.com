import apiSWR from 'utils/apiSWR'
import Loader from 'components/UI/Loader/Loader'

import { useSiteImg } from 'contexts/ImageVersionsContext'
import styles from '../AssetPage.module.scss'

const Sponsor = ({ id }) => {
  const siteImg = useSiteImg()
  const { data, error } = apiSWR(`/sponsor/${id}`, { revalidateOnFocus: false })
  if (!data || error) return <Loader />
  return (
    <p>
      {data.url ? (
        <a href={data.url} rel="nofollow noopener">
          {data.logo ? (
            <img
              src={siteImg(`corporate_sponsors/${data.logo}`)}
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
