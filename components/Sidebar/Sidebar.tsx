import tlc from 'constants/top_level_categories.json';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      {tlc[props.assetType].map(tlc => <div key={tlc}>{tlc}</div>)}
    </div>
  );
}

export default Sidebar;