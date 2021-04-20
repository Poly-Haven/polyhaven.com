import Link from 'next/link';

import CategoryList from './CategoryList';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  return (
    <div id={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.typeSelector}>
          <Link href="/hdris"><a className={
            `${styles.type} ${props.assetType === 'hdris' ? styles.activeType : ''}`
          }>
            <img src="/icons/type_H.svg" />
          </a></Link>
          <Link href="/textures"><a className={
            `${styles.type} ${props.assetType === 'textures' ? styles.activeType : ''}`
          }>
            <img src="/icons/type_T.svg" />
          </a></Link>
          <Link href="/models"><a className={
            `${styles.type} ${props.assetType === 'models' ? styles.activeType : ''}`
          }>
            <img src="/icons/type_M.svg" />
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