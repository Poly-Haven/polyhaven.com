import { useState } from 'react';
import Link from 'next/link';
import { assetTypeName } from 'utils/assetTypeName'
import { MdApps, MdFilterList, MdFirstPage } from 'react-icons/md'

import IconButton from "components/UI/Button/IconButton";
import CategoryList from './CategoryList';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  const [hideSidebar, setHideSidebar] = useState(true);

  const toggleSidebar = () => {
    setHideSidebar(!hideSidebar)
  }

  return (<>
    <div id={styles.sidebar} className={hideSidebar ? styles.hiddenMobile : null}>
      <div className={styles.sidebarInner}>
        <div className={styles.typeSelector}>
          <Link href="/all"><a className={
            `${styles.type}
            ${styles.typeAll}
            ${props.assetType === 'all' ? styles.activeType : ''}`
          }>
            <MdApps />
          </a></Link>
          <Link href="/hdris"><a className={
            `${styles.type}
            ${styles.typeHDRI}
            ${props.assetType === 'hdris' ? styles.activeType : ''}`
          }>
            <img src="/icons/type_H.svg" />
          </a></Link>
          <Link href="/textures"><a className={
            `${styles.type}
            ${styles.typeTex}
            ${props.assetType === 'textures' ? styles.activeType : ''}`
          }>
            <img src="/icons/type_T.svg" />
          </a></Link>
          <Link href="/models"><a className={
            `${styles.type}
            ${styles.typeMod}
            ${props.assetType === 'models' ? styles.activeType : ''}`
          }>
            <img src="/icons/type_M.svg" />
          </a></Link>
          <h2 id="typeHeader">{assetTypeName(props.assetType)}</h2>
        </div>
        <CategoryList
          assetType={props.assetType}
          categories={props.categories}
          level={-1} />
      </div>
    </div>
    <div className={`${styles.sidebarToggle} ${!hideSidebar ? styles.sidebarToggleClose : ''}`}>
      <IconButton icon={hideSidebar ? <MdFilterList /> : <MdFirstPage />} onClick={toggleSidebar} />
    </div>
  </>
  );
}

export default Sidebar;