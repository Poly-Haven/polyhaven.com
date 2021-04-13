import Link from 'next/link'

import CategoryList from './CategoryList';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      <Link href={`/${props.assetType}`}>
        <div className={styles.cat} key="all">All</div>
      </Link>
      <CategoryList
        assetType={props.assetType}
        categories={props.categories}
        level={-1} />
    </div>
  );
}

export default Sidebar;