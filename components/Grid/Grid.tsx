import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import GridItem from './GridItem/GridItem'
import Spinner from 'components/Spinner/Spinner';

import styles from './Grid.module.scss';

const Grid = (props) => {
  let url = `https://api.polyhaven.com/assets?t=${props.assetType}`
  if (props.categories) {
    url += "&c=" + props.categories.join(',')
  }
  const { data, error } = useSWR(url, fetcher, { revalidateOnFocus: false });

  if (error) {
    return (
      <div>Error</div>
    )
  }

  if (!data) {
    return (
      <div><Spinner /></div>
    )
  }

  return (
    <div className={styles.grid}>
      {Object.keys(data).map(asset => {
        return (<GridItem
          asset={data[asset]}
          assetID={asset}
          key={asset}></GridItem>);
      })}
    </div>
  );
}

export default Grid;