import Link from 'next/link'
import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import tlc from 'constants/top_level_categories.json';

import Spinner from 'components/Spinner/Spinner';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  const url = `https://api.polyhaven.com/categories/${props.assetType}`
  const { data, error } = useSWR(url, fetcher, { revalidateOnFocus: false });

  if (error) {
    return <div id={styles.sidebar}>Error</div>;
  }

  if (!data) {
    return <div id={styles.sidebar}><Spinner /></div>;
  }

  return (
    <div id={styles.sidebar}>
      <Link href={`/${props.assetType}`}>
        <div className={styles.tlc} key="all">All</div>
      </Link>
      {tlc[props.assetType].map(tlc => (
        <Link href={`/${props.assetType}/${tlc}`} key={tlc}>
          <div className={styles.tlc}>{tlc}
            <div className={styles.num} id={`tlc_${tlc}`}>
              {data[tlc] ? data[tlc] : 0}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;