import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { assetTypeName } from 'utils/assetTypeName'
import { MdApps, MdFilterList, MdFirstPage, MdUnarchive } from 'react-icons/md'

import Button from 'components/Button/Button';
import DisplayAd from 'components/Ads/DisplayAd';
import IconButton from "components/UI/Button/IconButton";
import CategoryList from './CategoryList';

import styles from './Sidebar.module.scss';

const Sidebar = (props) => {
  const { t: t_c } = useTranslation('common');
  const { t } = useTranslation('library');
  const [typeHeader, setTypeHeader] = useState(t_c(assetTypeName(props.assetType)))
  const [hideSidebar, setHideSidebar] = useState(true);

  useEffect(() => {
    setTypeHeader(t_c(assetTypeName(props.assetType)))
  }, [props.assetType])


  const toggleSidebar = () => {
    setHideSidebar(!hideSidebar)
  }

  const hovType = (e) => {
    setTypeHeader(t_c(e.currentTarget.getAttribute('data-assettype')))
  }
  const hovTypeLeave = (e) => {
    setTypeHeader(t_c(assetTypeName(props.assetType)))
  }

  return (<>
    <div id={styles.sidebar} className={hideSidebar ? styles.hiddenMobile : null}>
      <div className={styles.sidebarInner}>
        <div className={styles.typeSelector}>
          <Link href="/all"><a className={
            `${styles.type}
            ${props.assetType === 'all' ? styles.activeType : ''}`
          } data-assettype="All Assets" onMouseEnter={hovType} onMouseLeave={hovTypeLeave}>
            <MdApps />
          </a></Link>
          <Link href="/hdris"><a className={
            `${styles.type}
            ${props.assetType !== 'all' && props.assetType !== 'hdris' ? styles.desaturate : ''}
            ${props.assetType === 'hdris' ? styles.activeType : ''}`
          } data-assettype="HDRIs" onMouseEnter={hovType} onMouseLeave={hovTypeLeave}>
            <img src="/icons/a_hdris.png" />
          </a></Link>
          <Link href="/textures"><a className={
            `${styles.type}
            ${props.assetType !== 'all' && props.assetType !== 'textures' ? styles.desaturate : ''}
            ${props.assetType === 'textures' ? styles.activeType : ''}`
          } data-assettype="Textures" onMouseEnter={hovType} onMouseLeave={hovTypeLeave}>
            <img src="/icons/a_textures.png" />
          </a></Link>
          <Link href="/models"><a className={
            `${styles.type}
            ${props.assetType !== 'all' && props.assetType !== 'models' ? styles.desaturate : ''}
            ${props.assetType === 'models' ? styles.activeType : ''}`
          } data-assettype="Models" onMouseEnter={hovType} onMouseLeave={hovTypeLeave}>
            <img src="/icons/a_models.png" />
          </a></Link>
          <h2 id="typeHeader">{typeHeader}</h2>
        </div>
        <CategoryList
          assetType={props.assetType}
          categories={props.categories}
          level={-1} />
      </div>
      <div className={styles.spacer} />
      <hr />
      <div className={styles.footerWrapper}>
        <DisplayAd id="9211333899" x={200} y={200} showRemoveBtn />
        <div className={styles.footer}>
          <Button text={t_c('nav.contribute')} icon={<MdUnarchive />} href="/contribute" color="hollowFaded" style={{ padding: '0.5em', margin: 0 }} />
          <p><Link href="/faq">{t_c('nav.faq')}</Link><br /><Link href="/license">{t_c('nav.license')}</Link></p>
        </div>
      </div>
    </div>
    <div className={`${styles.sidebarToggle} ${!hideSidebar ? styles.sidebarToggleClose : ''}`}>
      <IconButton icon={hideSidebar ? <MdFilterList /> : <MdFirstPage />} onClick={toggleSidebar} />
    </div>
  </>
  );
}

export default Sidebar;