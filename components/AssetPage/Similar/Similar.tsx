import apiSWR from 'utils/apiSWR'
import LazyLoad from 'react-lazy-load';

import GridItem from 'components/Library/Grid/GridItem/GridItem'
import Loader from 'components/UI/Loader/Loader'

import styles from './Similar.module.scss'

const Similar = ({ slug, onClick }) => {
  const { data, error } = apiSWR(`/similar/${slug}`, { revalidateOnFocus: false });
  if (error || !data) {
    return <Loader />
  }

  return (
    <div className={styles.wrapper}>
      {Object.keys(data).map(asset => {
        return (<LazyLoad key={asset} className={styles.item}><GridItem
          asset={data[asset]}
          assetID={asset}
          onClick={onClick}
        /></LazyLoad>);
      })}
    </div>
  )
}

export default Similar
