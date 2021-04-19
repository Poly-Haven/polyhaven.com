import CategoryList from './CategoryList';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <CategoryList
          assetType={props.assetType}
          categories={props.categories}
          level={-1} />
      </div>
    </div>
  );
}

export default Sidebar;