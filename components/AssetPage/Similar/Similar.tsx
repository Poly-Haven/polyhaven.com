import apiSWR from 'utils/apiSWR'

import GridItem from 'components/Grid/GridItem/GridItem'
import Loader from 'components/UI/Loader/Loader'

import styles from './Similar.module.scss'

const Similar = ({ slug, scrollPosition, onClick }) => {
  const { data, error } = apiSWR(`/similar/${slug}`, { revalidateOnFocus: false });
  if (error || !data) {
    return <Loader />
  }

  return (
    <div className={styles.wrapper}>
      {Object.keys(data).map(asset => {
        return (<div className={styles.item} key={asset}><GridItem
          asset={data[asset]}
          assetID={asset}
          scrollPosition={scrollPosition}
          onClick={onClick}
        /></div>);
      })}
    </div>
  )
}

export default Similar
