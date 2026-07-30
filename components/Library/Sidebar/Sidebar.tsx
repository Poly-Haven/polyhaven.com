import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { assetTypeName } from 'utils/assetTypeName'
import { MdApps, MdFilterList, MdFirstPage, MdUnarchive, MdKeyboardArrowRight } from 'react-icons/md'

import Button from 'components/UI/Button/Button'
import IconButton from 'components/UI/Button/IconButton'
import CategoryList from './CategoryList'
import AttributeFilters from './AttributeFilters'
import apiSWR from 'utils/apiSWR'
import { filterAssets } from 'utils/assetFiltering'

import styles from './Sidebar.module.scss'

const Sidebar = (props) => {
  const { t: t_c } = useTranslation('common')
  const [typeHeader, setTypeHeader] = useState(t_c(assetTypeName(props.assetType)))
  const [hideSidebar, setHideSidebar] = useState(true)
  const router = useRouter()

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

  // Same request the grid and category tree use — SWR dedupes it. Attribute facet counts are
  // scoped to the current category/collection/vault so the numbers match what's on screen.
  const { data: assetData } = apiSWR(`/assets?t=${props.assetType}&future=true`, { revalidateOnFocus: false })
  const scopedAssets = assetData
    ? filterAssets(assetData, {
        categoryPath: props.categoryPath,
        collection: props.collection ? props.collection.id : null,
        vault: props.vault ? props.vault.id : null,
      })
    : null

  return (
    <>
      <div id={styles.sidebar} className={hideSidebar ? styles.hiddenMobile : null}>
        <div className={styles.sidebarInner}>
          <div className={styles.typeSelector}>
            <Link
              href="/all"
              className={`${styles.type}
        ${props.assetType === 'all' ? styles.activeType : ''}`}
              data-assettype="All Assets"
              onMouseEnter={hovType}
              onMouseLeave={hovTypeLeave}
            >
              <MdApps />
            </Link>
            <Link
              href="/hdris"
              className={`${styles.type}
        ${props.assetType !== 'all' && props.assetType !== 'hdris' ? styles.desaturate : ''}
        ${props.assetType === 'hdris' ? styles.activeType : ''}`}
              data-assettype="HDRIs"
              onMouseEnter={hovType}
              onMouseLeave={hovTypeLeave}
            >
              <img src="/icons/a_hdris.png" />
            </Link>
            <Link
              href="/textures"
              className={`${styles.type}
        ${props.assetType !== 'all' && props.assetType !== 'textures' ? styles.desaturate : ''}
        ${props.assetType === 'textures' ? styles.activeType : ''}`}
              data-assettype="Textures"
              onMouseEnter={hovType}
              onMouseLeave={hovTypeLeave}
            >
              <img src="/icons/a_textures.png" />
            </Link>
            <Link
              href="/models"
              className={`${styles.type}
        ${props.assetType !== 'all' && props.assetType !== 'models' ? styles.desaturate : ''}
        ${props.assetType === 'models' ? styles.activeType : ''}`}
              data-assettype="Models"
              onMouseEnter={hovType}
              onMouseLeave={hovTypeLeave}
            >
              <img src="/icons/a_models.png" />
            </Link>
            <h2 id="typeHeader">{typeHeader}</h2>
          </div>
          <CategoryList
            assetType={props.assetType}
            categoryPath={props.categoryPath}
            attributes={props.attributes}
            collection={props.collection}
            vault={props.vault}
          />
          <AttributeFilters
            assetType={props.assetType}
            assets={scopedAssets}
            active={props.attributes || {}}
            author={props.author}
          />
          {props.assetType === 'all' && (
            <>
              <hr />
              <div>
                <div>
                  <div>
                    <Link href="/collections" className={`${styles.cat}`}>
                      <MdKeyboardArrowRight className={styles.caret} />
                      {t_c('nav.collections')}
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className={styles.spacer} />
        <hr />
        <div className={styles.footerWrapper}>
          <div className={styles.footer}>
            <Button
              text={t_c('nav.contribute')}
              icon={<MdUnarchive />}
              href="/contribute"
              color="hollowFaded"
              style={{ padding: '0.5em', margin: 0 }}
            />
            <p>
              <Link href={`https://docs.polyhaven.com/${router.locale}/faq`} legacyBehavior>
                {t_c('nav.faq')}
              </Link>
              <br />
              <Link href="/license" legacyBehavior>
                {t_c('nav.license')}
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className={`${styles.sidebarToggle} ${!hideSidebar ? styles.sidebarToggleClose : ''}`}>
        <IconButton icon={hideSidebar ? <MdFilterList /> : <MdFirstPage />} onClick={toggleSidebar} />
      </div>
    </>
  )
}

export default Sidebar
