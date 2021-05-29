import useSWR from 'swr';
import Fuse from 'fuse.js';
import { trackWindowScroll } from 'react-lazy-load-image-component';
import 'react-dropdown/style.css';
import { MdSearch } from 'react-icons/md'
import { MdClose } from 'react-icons/md'

import fetcher from 'utils/fetcher';
import { weightedDownloadsPerDay } from 'utils/dateUtils'
import { titleCase } from 'utils/stringUtils'
import { assetTypeName } from 'utils/assetTypeName'

import GridItem from './GridItem/GridItem'
import Spinner from 'components/Spinner/Spinner';
import AdTop from 'components/Ads/GridTop'
import Dropdown from 'components/UI/Dropdown/Dropdown'

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
      return Object.keys(d).sort((a, b) => d[a].name.localeCompare(d[b].name))
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
  const resetSearch = () => {
    props.setSearch("");
  }

  const asset_type_name = assetTypeName(props.assetType)

  const setHeaderPath = () => {
    let path = ''
    let link = ''
    if (props.assetType !== 'all') {
      link += `/${props.assetType}`
      path += `<a href=${encodeURI(link)}>${asset_type_name}</a> /`
    }
    for (const c of props.categories) {
      link += `/${c}`
      path += ` <a href=${encodeURI(link)}>${c}</a> /`
    }
    document.getElementById('header-frompath').innerHTML = path.trim()
  }

  let url = `https://api.polyhaven.com/assets?t=${props.assetType}`
  if (props.categories.length) {
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

  if (props.author) {
    sortedKeys = sortedKeys.filter(k => Object.keys(data[k].authors).includes(props.author));
  }

  let title = assetTypeName(props.assetType);
  if (props.categories.length) {
    title = asset_type_name + ": " + titleCase(props.categories.join(' > '))
  } else if (props.assetType !== "all") {
    title = "All " + title;
  }
  if (props.author) {
    title += ` (by ${props.author})`;
  }
  const fSize = Math.floor(title.length / 17.5);  // Rough detection of line length used to reduce font size.

  return (
    <>
      <div className={styles.optionsBar}>
        <div className={styles.gridHeader}>
          <h1 className={styles['s' + fSize]}>{title}</h1>
          <div className={styles.options}>
            <div className={styles.menuSelection}>
              <Dropdown
                value={props.sort}
                options={Object.keys(sortBy)}
                onChange={setSort}
              />
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
              {props.search ?
                <MdClose className={styles.resetSearchIcon} onClick={resetSearch} />
                : null}
            </div>
            {props.search ? <p>{sortedKeys.length} results</p> : null}
          </div>
        </div>
        <div className={styles.adGridTop}>
          <AdTop />
        </div>
      </div>

      {sortedKeys.length ?
        <div className={styles.grid}>
          {sortedKeys.map(asset => {
            return (<GridItem
              key={asset}
              asset={data[asset]}
              assetID={asset}
              onClick={setHeaderPath}
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