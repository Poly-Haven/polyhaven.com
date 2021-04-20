import Link from 'next/link';

import CategoryList from './CategoryList';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.typeSelector}>
          <Link href="/hdris"><a className={styles.type}>
            H
          </a></Link>
          <Link href="/textures"><a className={styles.type}>
            T
          </a></Link>
          <Link href="/models"><a className={styles.type}>
            M
          </a></Link>
        </div>
        <CategoryList
          assetType={props.assetType}
          categories={props.categories}
          level={-1} />
      </div>
    </div>
  );
}

export default Sidebar;