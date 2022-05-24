import { useState } from 'react';
import Link from 'next/link';
import { assetTypeName } from 'utils/assetTypeName'
import { MdApps, MdFilterList, MdFirstPage, MdUnarchive } from 'react-icons/md'

import Button from 'components/Button/Button';
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
            <img src="/icons/a_hdris.png" />
          </a></Link>
          <Link href="/textures"><a className={
            `${styles.type}
            ${styles.typeTex}
            ${props.assetType === 'textures' ? styles.activeType : ''}`
          }>
            <img src="/icons/a_textures.png" />
          </a></Link>
          <Link href="/models"><a className={
            `${styles.type}
            ${styles.typeMod}
            ${props.assetType === 'models' ? styles.activeType : ''}`
          }>
            <img src="/icons/a_models.png" />
          </a></Link>
          <h2 id="typeHeader">{assetTypeName(props.assetType)}</h2>
        </div>
        <CategoryList
          assetType={props.assetType}
          categories={props.categories}
          level={-1} />
      </div>
      <div className={styles.spacer} />
      <hr />
      <div className={styles.footer}>
        <Button text="Contribute" icon={<MdUnarchive />} href="/contribute" color="hollowFaded" style={{ padding: '0.5em', margin: 0 }} />
        <p><Link href="/faq">FAQ</Link> · <Link href="/license">License</Link></p>
      </div>
    </div>
    <div className={`${styles.sidebarToggle} ${!hideSidebar ? styles.sidebarToggleClose : ''}`}>
      <IconButton icon={hideSidebar ? <MdFilterList /> : <MdFirstPage />} onClick={toggleSidebar} />
    </div>
  </>
  );
}

export default Sidebar;