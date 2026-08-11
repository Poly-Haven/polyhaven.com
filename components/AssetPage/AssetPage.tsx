import { useTranslation, Trans } from 'next-i18next'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Markdown from 'markdown-to-jsx'
import { timeago } from 'utils/dateUtils'
import { titleCase, formatNumber } from 'utils/stringUtils'
import { inCollection } from 'utils/assetFiltering'
import { isFormerlyVaulted, isUnlockedVault, isVaultLocked, vaultOf } from 'utils/vaults'

import useDivSize from 'hooks/useDivSize'
import asset_types from 'constants/asset_types.json'
import asset_type_names from 'constants/asset_type_names.json'
import useStoredState from 'hooks/useStoredState'
import { useUserPatron } from 'contexts/UserPatronContext'

import { MdFileDownload, MdLastPage, MdLocationOn, MdShowChart } from 'react-icons/md'
import { IoMdUnlock } from 'react-icons/io'

import AuthorCredit from 'components/AssetPage/AuthorCredit'
import HeartLock from 'components/UI/Icons/HeartLock'
import Carousel from './Carousel/Carousel'
import Download from './Download/Download'
import AfterDownload from './AfterDownload'
import Heart from 'components/UI/Icons/Heart'
import IconButton from 'components/UI/Button/IconButton'
import InfoItem from './InfoItem'
import InfoBlock from './InfoBlock'
import CategoryBreadcrumb from './CategoryBreadcrumb'
import AssetAttributes from './AssetAttributes'
import Page from 'components/Layout/Page/Page'
import Similar from './Similar/Similar'
import Spinner from 'components/UI/Spinner/Spinner'
import SponsorList from './SponsorList/SponsorList'
import TagsList from './TagsList'
import TilePreview from './WebGL/TilePreview'
import Button from 'components/UI/Button/Button'

import styles from './AssetPage.module.scss'
import ErrorBoundary from 'utils/ErrorBoundary'

const PanoViewer = dynamic(() => import('./WebGL/PanoViewer'), { ssr: false })
const UserRenders = dynamic(() => import('./UserRenders'), { ssr: false })
const GLTFViewer = dynamic(() => import('./WebGL/GLTFViewer'), { ssr: false })
const AssetDlGraph = dynamic(() => import('components/Stats/AssetDlGraph'), { ssr: false })

const AssetPage = ({ assetID, data, files, renders, postDownloadStats, vaultInfo }) => {
  const { t: tc } = useTranslation('common')
  const { t: tt } = useTranslation('time')
  const { t } = useTranslation('asset')
  const { t: tcat } = useTranslation('categories')
  const { t: tlib } = useTranslation('library')
  const { patron } = useUserPatron()
  const [uuid, setUuid] = useState(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(
    `https://cdn.polyhaven.com/asset_img/primary/${assetID}.png?height=760&quality=95`
  )
  const [activeImageSrc, setActiveImageSrc] = useState(`https://cdn.polyhaven.com/asset_img/primary/${assetID}.png`) // Without height=X, used to highlight active image in carousel
  const [showWebGL, setShowWebGL] = useState(false)
  const [showTilePreview, setShowTilePreview] = useState('')
  const [showDownloadGraph, setShowDownloadGraph] = useStoredState('asset_showDownloadGraph', false)
  const [showAfterDownloadPopup, setShowAfterDownloadPopup] = useState(false)
  const [hideSidebar, setHideSidebar] = useState(true)
  const [shouldLoadUserRenders, setShouldLoadUserRenders] = useState(false)
  const widthRef = useRef(null)
  const userRendersRef = useRef(null)
  const { width: sidebarWidth } = useDivSize(widthRef)

  const authors = Object.keys(data.authors).sort()
  const multiAuthor = authors.length > 1

  const msPerDay = 24 * 60 * 60 * 1000
  const monthAgo = new Date(Date.now() - 30 * msPerDay).toISOString().split('T')[0]
  const daysOld = (Date.now() - data.date_published * 1000) / msPerDay
  const isOlderThanFourDays = Date.now() - data.date_published * 1000 > 4 * msPerDay
  let [ageValue, ageLabel] = timeago(data.date_published * 1000, tt, true)
  ageValue = ageValue === 0 ? tt('new') : ageValue
  ageLabel = ageLabel.replace(ageValue, '').trim()

  const maxRes = files['blend']
    ? Object.keys(files['blend'])
        .map((r) => parseInt(r))
        .sort((a, b) => a - b)
        .pop()
    : 0

  // Use texel density if available, otherwise calculate from dimensions (only for textures), otherwise 0
  const texelDensity = data.texel_density
    ? data.texel_density
    : data.type === 1 && data.dimensions
    ? (maxRes * 1024) / (data.dimensions[0] / 1000)
    : 0 // px/m

  const largestDimension = data.dimensions ? Math.max(...data.dimensions) : 0
  const largestAxis = data.dimensions ? data.dimensions.indexOf(largestDimension) : 0
  const sizeWord = data.type === 1 ? ['wide', 'tall', 'ERR'][largestAxis] : ['wide', 'wide', 'tall'][largestAxis]

  const vault = vaultOf(data)
  // A released asset keeps its vault id so we can credit the vault that produced it, so anything
  // that means "still paywalled" has to check the lock, not the id.
  const vaultLocked = isVaultLocked(data)
  // Needs both halves to agree: the asset is out of its vault, and the vault is on record as
  // released. Without the vault doc there is no name to celebrate, and a published asset whose
  // vault still reads as locked is a data error, not something to put a banner on.
  const exVault = isFormerlyVaulted(data) && isUnlockedVault(vaultInfo) && vaultInfo?.name ? vaultInfo : null

  const assetTypeKey = Object.keys(asset_types)[data.type]

  const toggleSidebar = () => {
    setHideSidebar(!hideSidebar)
  }

  useEffect(() => {
    // Page changes
    document.getElementById('header-title').innerHTML = data.name
    let path = document.getElementById('header-frompath').innerHTML
    if (!path) {
      path = `<a href="/${Object.keys(asset_types)[data.type]}">${tc(asset_type_names[data.type] + 's')}</a> /`
    }
    document.getElementById('header-path').innerHTML = path
    document.getElementById('header-frompath').innerHTML = ''
    document.getElementById('page').scrollTop = 0

    setPageLoading(false)
    const defaultImg = `https://cdn.polyhaven.com/asset_img/primary/${assetID}.png`
    if (activeImageSrc !== defaultImg) {
      setPreviewImage(defaultImg)
    }

    return () => {
      document.getElementById('header-path').innerHTML = ''
      document.getElementById('header-title').innerHTML = ''
    }
  }, [assetID])

  // Intersection Observer for UserRenders lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoadUserRenders) {
            setShouldLoadUserRenders(true)
          }
        })
      },
      {
        threshold: 0.1,
      }
    )

    const currentRef = userRendersRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [shouldLoadUserRenders])

  const clickSimilar = () => {
    setPageLoading(true)
    setShowWebGL(false)
    setShowTilePreview('')
  }

  const setPreviewImage = (src) => {
    if (!activeImage.startsWith(src)) {
      setImageLoading(true)
    }
    if (showWebGL) {
      setShowWebGL(false)
    }
    setActiveImageSrc(src)
    if (src.startsWith('https://cdn.polyhaven.com/')) {
      src += '?height=760&quality=95'
    }
    setActiveImage(src)
    setShowTilePreview('')
  }
  const imageLoaded = (e) => {
    setImageLoading(false)
    setPageLoading(false)
    setShowWebGL(false)
    setShowTilePreview('')
  }

  const clickShowWebGL = (_) => {
    setShowWebGL(true)
    setShowTilePreview('')
    setActiveImageSrc('webGL')
    if (data.type !== 0) {
      setImageLoading(true)
    }
  }

  const clickShowTilePreview = (src) => {
    setShowTilePreview(src)
    setShowWebGL(false)
    setActiveImageSrc(src)
  }

  const afterDownloadCallback = () => {
    setShowAfterDownloadPopup(true)
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.loading} ${!pageLoading ? styles.hidden : null}`}>
        <Spinner />
      </div>
      <Page immersiveScroll assetPage>
        <div className={styles.mobileHeader}>
          <h1>{data.name}</h1>
          <div className={`${styles.sidebarToggle} ${!hideSidebar ? styles.sidebarToggleClose : ''}`}>
            <IconButton icon={hideSidebar ? <MdFileDownload /> : <MdLastPage />} onClick={toggleSidebar} />
          </div>
        </div>

        <div className={styles.previewWrapper}>
          <div className={`${styles.activePreview}${showWebGL ? ' ' + styles.activePreviewGLTF : ''}`}>
            {/* The LCP element on every asset page: tell the browser so, rather than leaving it
                to be discovered at the default priority alongside everything else. */}
            <img
              id="activePreview"
              onLoad={imageLoaded}
              src={activeImage}
              alt={data.description}
              fetchPriority="high"
              decoding="async"
            />
            {data.sketchfab_id ? (
              showWebGL ? (
                <div className={styles.sketchfabWrapper}>
                  <iframe
                    className={styles.sketchfabFrame}
                    title={data.name}
                    allow="autoplay; fullscreen; xr-spatial-tracking"
                    xr-spatial-tracking
                    execution-while-out-of-viewport
                    execution-while-not-rendered
                    src={`https://sketchfab.com/models/${data.sketchfab_id}/embed?autostart=1&ui_theme=dark&dnt=1&ui_stop=0`}
                    onLoad={() => {
                      setImageLoading(false)
                    }}
                  ></iframe>
                </div>
              ) : null
            ) : data.type === 0 ? (
              showWebGL ? (
                <PanoViewer assetID={assetID} />
              ) : null
            ) : (
              <ErrorBoundary>
                <GLTFViewer
                  show={showWebGL}
                  assetID={assetID}
                  files={files}
                  onLoad={(_) => {
                    setImageLoading(false)
                  }}
                />
              </ErrorBoundary>
            )}
            {data.type !== 0 && showTilePreview ? (
              <TilePreview image={showTilePreview} resolutions={Object.keys(files['blend'])} type={data.type} />
            ) : null}
            <div className={`${styles.loading} ${!imageLoading ? styles.hidden : null}`}>
              <Spinner />
            </div>
          </div>
        </div>
        <div className={styles.carousel}>
          <Carousel
            slug={assetID}
            name={data.name}
            data={renders}
            files={files}
            assetType={data.type}
            setter={setPreviewImage}
            showWebGL={clickShowWebGL}
            showTilePreview={clickShowTilePreview}
            active={activeImageSrc}
          />
        </div>
        <div className={styles.similar}>
          <h2>{t('similar-assets')}</h2>
          <Similar slug={assetID} onClick={clickSimilar} />
        </div>
        <div ref={userRendersRef}>
          {shouldLoadUserRenders ? <UserRenders assetID={assetID} /> : <div style={{ minHeight: '200px' }} />}
        </div>
      </Page>

      <AfterDownload show={showAfterDownloadPopup} assetType={data.type} postDownloadStats={postDownloadStats} />

      <div className={`${styles.sidebar} ${hideSidebar ? styles.hiddenMobile : ''}`}>
        <div className={styles.info}>
          <Download
            assetID={assetID}
            data={data}
            files={files}
            setPreview={setPreviewImage}
            patron={patron}
            texelDensity={texelDensity}
            callback={afterDownloadCallback}
            vault={vault}
            scheduleText={`${ageValue} ${ageLabel}`}
          />
          <div className={styles.infoItems}>
            <InfoItem label={t('author', { count: authors.length })} flex>
              <div className={styles.authors}>
                {authors.map((a) => (
                  <AuthorCredit id={a} key={a} credit={multiAuthor ? data.authors[a] : ''} />
                ))}
              </div>
              {data.donated ? (
                <div className={styles.heart} data-tip={t('author-donated')}>
                  <Heart />
                </div>
              ) : null}
            </InfoItem>

            {data.info ? (
              <div>
                <div className={styles.infoText} lang="en" dir="ltr">
                  <Markdown>{data.info.replace(/\\n/g, '\n')}</Markdown>
                </div>
              </div>
            ) : null}

            {exVault ? (
              <div className={styles.unvaulted}>
                <h3>{t('unvaulted.title')} 🎉</h3>
                <p>
                  <Trans
                    i18nKey="asset:unvaulted.freed"
                    t={t}
                    values={{ vault: exVault.name }}
                    components={{ vaultLink: <Link href={`/vaults/${vault}`} prefetch={false} /> }}
                  />
                </p>
                {exVault.unlocked ? (
                  <p className={styles.unvaultedDate}>
                    {tc('unlocked-on', {
                      date: new Date(exVault.unlocked).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }),
                    })}
                  </p>
                ) : null}
                <Button text={t('unvaulted.help-unlock')} href="/vaults" color="community" icon={<HeartLock />} />
              </div>
            ) : null}

            {inCollection(data, 'project_lighthouse') ? (
              <div className={styles.community} lang="en" dir="ltr">
                <h3>Poly Haven's Biggest Project</h3>
                <p>
                  This asset was made for Poly Haven's{' '}
                  <Link href="https://store.steampowered.com/app/4162610/Project_Lighthouse/" target="_blank">
                    upcoming game
                  </Link>
                  . Want to help us?
                </p>
                <Button text="Join Project Lighthouse" href="https://phvn.io/lighthouse" color="community" />
              </div>
            ) : null}

            <div className={styles.infoBlocks}>
              <InfoBlock
                value="CC0"
                label={tc('nav.license')}
                link="/license"
                tip="Use for any purpose, including commercial.<br/>Click for more info."
              />
              {data.dimensions ? (
                <InfoBlock
                  value={`${parseFloat((largestDimension / 1000).toFixed(1))}m`}
                  label={t(sizeWord)}
                  condition={Boolean(data.dimensions)}
                  tip={`${data.dimensions.map((x) => Math.round(x)).join(' x ')}mm`}
                />
              ) : null}
              {texelDensity ? (
                <InfoBlock
                  value={`${parseFloat((texelDensity / 100).toFixed(1))}`}
                  label="px/cm"
                  condition={Boolean(data.dimensions)}
                  tip={`Texel density at ${maxRes}K. Equal to ${Math.round(texelDensity)}px/m.`}
                />
              ) : null}
              <InfoBlock
                value={data.evs_cap}
                label="EVs"
                condition={Boolean(data.evs_cap)}
                tip={`${data.evs_cap} EVs of dynamic range captured. Unclipped.`}
              />
              <InfoBlock
                value={`${data.whitebalance}K`}
                label="WB"
                condition={Boolean(data.whitebalance)}
                tip="Whitebalance"
              />
              <InfoBlock
                value={<MdLocationOn />}
                label="GPS"
                condition={Boolean(data.coords)}
                link={
                  data.coords
                    ? `https://www.openstreetmap.org/?mlat=${data.coords[0]}&mlon=${data.coords[1]}&zoom=14#map=13/${data.coords[0]}/${data.coords[1]}`
                    : null
                }
              />
              <InfoBlock
                value={formatNumber(data.polycount)}
                label="tris"
                condition={Boolean(data.polycount)}
                tip={`${data.polycount} triangles, before any subdivisions.`}
              />
            </div>

            <InfoItem label={t('downloads')} condition={Boolean(data.download_count)} flex>
              <span data-tip={`${Math.round(data.download_count / daysOld)} ${t('downloads-pd')}`}>
                {data.download_count}
              </span>
              {isOlderThanFourDays ? (
                showDownloadGraph ? (
                  <AssetDlGraph slug={assetID} dateFrom={monthAgo} />
                ) : (
                  <div className={styles.tag}>
                    <MdShowChart onClick={(_) => setShowDownloadGraph(true)} />
                  </div>
                )
              ) : null}
            </InfoItem>

            <div className={styles.spacer} />
            <SponsorList assetID={assetID} sponsors={data.sponsors} patron={patron} />
            <div className={styles.spacer} />

            <div ref={widthRef} style={{ marginTop: '1rem' }}>
              <CategoryBreadcrumb
                assetType={assetTypeKey}
                category={data.category}
                label={t('category', { defaultValue: 'Category' })}
                t={tcat}
              />
              <AssetAttributes assetType={assetTypeKey} attributes={data.attributes} t={tlib} />
              <TagsList
                label={t('tags')}
                list={data.tags}
                linkPrefix={`/${Object.keys(asset_types)[data.type]}?s=`}
                width={sidebarWidth}
              />
            </div>
            <InfoItem label={t('released')}>
              {vaultLocked ? (
                <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                  When the{' '}
                  <Link href={`/vaults/${vault}`} prefetch={false}>
                    {titleCase(vault)} Vault
                  </Link>{' '}
                  is unlocked
                </span>
              ) : (
                <span
                  title={new Date(data.date_published * 1000).toLocaleDateString()}
                >{`${ageValue} ${ageLabel}`}</span>
              )}
            </InfoItem>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetPage
