import Link from 'next/link'

import tlc from 'constants/top_level_categories.json';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      <Link href={`/${props.assetType}`}>
        <div key="All">All</div>
      </Link>
      {tlc[props.assetType].map(tlc => (
        <Link href={`/${props.assetType}/${tlc}`} key={tlc}>
          <div>{tlc}</div>
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;