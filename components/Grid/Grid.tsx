import useSWR from 'swr';
import fetcher from 'utils/fetcher';
import { trackWindowScroll } from 'react-lazy-load-image-component';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { daysOld, weightedDownloadsPerDay } from 'utils/dateUtils'

import GridItem from './GridItem/GridItem'
import Spinner from 'components/Spinner/Spinner';
import AdTop from 'components/Ads/GridTop'

import styles from './Grid.module.scss';

const Grid = (props) => {
  const sortBy = {
    hot: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return (weightedDownloadsPerDay(d[b].download_count, d[b].date_published) - weightedDownloadsPerDay(d[a].download_count, d[a].date_published));
      })
    },
    latest: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return (d[b].date_published - d[a].date_published);
      })
    },
    top: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return (d[b].download_count - d[a].download_count);
      })
    },
    name: (d: Object) => {
      return Object.keys(d).sort(function (a, b) {
        return (d[b].name - d[a].name);
      })
    },
  }
  const setSort = selectedOption => {
    props.setSort(selectedOption.value)
  };


  let url = `https://api.polyhaven.com/assets?t=${props.assetType}`
  if (props.categories) {
    url += "&c=" + props.categories.join(',')
  }
  const { data, error } = useSWR(url, fetcher, { revalidateOnFocus: false });
  if (error) return <div>Error</div>
  if (!data) return <div><Spinner /></div>

  return (
    <>
      <div className={styles.optionsBar}>
        <div className={styles.options}>
          <div className={styles.menuSelection}>
            <Dropdown
              className={styles.menu}
              controlClassName={styles.control}
              menuClassName={styles.dropdown}
              placeholderClassName={styles.labelSort}
              arrowClassName={styles.arrow}
              options={Object.keys(sortBy)}
              value={props.sort}
              placeholder="Select an option"
              onChange={setSort} />
          </div>
        </div>
        <div className={styles.adGridTop}>
          <AdTop />
        </div>
      </div>
      <div className={styles.grid}>
        {sortBy[props.sort](data).map(asset => {
          return (<GridItem
            asset={data[asset]}
            assetID={asset}
            key={asset}
            scrollPosition={props.scrollPosition} />);
        })}
      </div>
    </>
  );
}

export default trackWindowScroll(Grid);