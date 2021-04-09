import Link from 'next/link'

import tlc from 'constants/top_level_categories.json';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      {tlc[props.assetType].map(tlc => (
        <Link href={`/${props.assetType}/${tlc}`}>
          <div key={tlc}>{tlc}</div>
        </Link>
      ))}
    </div>
  );
}

export default Sidebar;