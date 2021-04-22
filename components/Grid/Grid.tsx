import useSWR from 'swr';
import Fuse from 'fuse.js';
import { trackWindowScroll } from 'react-lazy-load-image-component';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import { MdSearch } from 'react-icons/md'

import fetcher from 'utils/fetcher';
import { weightedDownloadsPerDay } from 'utils/dateUtils'

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
  const setSearch = event => {
    props.setSearch(event.target.value);
  }
  const submitSearch = event => {
    event.preventDefault();
  }


  let url = `https://api.polyhaven.com/assets?t=${props.assetType}`
  if (props.categories) {
    url += "&c=" + props.categories.join(',')
  }
  const { data, error } = useSWR(url, fetcher, { revalidateOnFocus: false });
  if (error) return <div>Error</div>
  if (!data) return <div><Spinner /></div>

  let sortedKeys = sortBy[props.sort](data);

  if (props.search) {
    const fuse = new Fuse(Object.values(data), {
      keys: ['categories', 'tags', 'name'],
      includeScore: true,
      threshold: 0.2
    })
    const searchResults = fuse.search(props.search);
    const filteredData = {};
    for (const sr of searchResults) {
      let srID = Object.keys(data)[sr.refIndex];
      filteredData[srID] = data[srID];
    }
    sortedKeys = Object.keys(filteredData)
  }


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
          <div className={styles.search}>
            <MdSearch className={styles.searchIcon} />
            <form onSubmit={submitSearch}>
              <input
                type="text"
                placeholder="Search..."
                value={props.search}
                onChange={setSearch} />
            </form>
          </div>
          {props.search ? <p>{sortedKeys.length} results</p> : null}
        </div>
        <div className={styles.adGridTop}>
          <AdTop />
        </div>
      </div>

      {sortedKeys.length ?
        <div className={styles.grid}>
          {sortedKeys.map(asset => {
            return (<GridItem
              asset={data[asset]}
              assetID={asset}
              key={asset}
              scrollPosition={props.scrollPosition} />);
          })}
        </div>
        :
        <div className={styles.noResults}>
          <h2>No results :(</h2>
          {props.search ? <p>Try using a different keyword</p> : null}
        </div>
      }
    </>
  );
}

export default trackWindowScroll(Grid);