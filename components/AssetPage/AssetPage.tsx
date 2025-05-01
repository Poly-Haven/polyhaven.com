import { useTranslation } from 'next-i18next'
import React, { useState, useEffect, useRef } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Markdown from 'markdown-to-jsx'
import { timeago } from 'utils/dateUtils'
import { titleCase, formatNumber } from 'utils/stringUtils'

import useDivSize from 'hooks/useDivSize'
import asset_types from 'constants/asset_types.json'
import asset_type_names from 'constants/asset_type_names.json'
import { getPatronInfo } from 'utils/patronInfo'
import useStoredState from 'hooks/useStoredState'

import { MdFileDownload, MdLastPage, MdLocationOn, MdShowChart } from 'react-icons/md'

import AssetDlGraph from 'components/Stats/AssetDlGraph'
import AuthorCredit from 'components/AssetPage/AuthorCredit'
import Carousel from './Carousel/Carousel'
import DisplayAd from 'components/Ads/DisplayAd'
import Download from './Download/Download'
import AfterDownload from './AfterDownload'
import GLTFViewer from './WebGL/GLTFViewer'
import Heart from 'components/UI/Icons/Heart'
import IconButton from 'components/UI/Button/IconButton'
import InfoItem from './InfoItem'
import InfoBlock from './InfoBlock'
import Page from 'components/Layout/Page/Page'
import Similar from './Similar/Similar'
import Spinner from 'components/UI/Spinner/Spinner'
import SponsorList from './SponsorList/SponsorList'
import TagsList from './TagsList'
import TilePreview from './WebGL/TilePreview'
import UserRenders from './UserRenders'

import styles from './AssetPage.module.scss'
import ErrorBoundary from 'utils/ErrorBoundary'

const PanoViewer = dynamic(() => import('./WebGL/PanoViewer'), { ssr: false })

const AssetPage = ({ assetID, data, files, renders, postDownloadStats }) => {
  const { t: tc } = useTranslation('common')
  const { t: tt } = useTranslation('time')
  const { t } = useTranslation('asset')
  const { user, isLoading: userIsLoading } = useUser()
  const [uuid, setUuid] = useState(null)
  const [patron, setPatron] = useState({})
  const [pageLoading, setPageLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [activeImage, setActiveImage] = useState(
    `https://cdn.polyhaven.com/asset_img/primary/${assetID}.png?height=760`
  )
  const [activeImageSrc, setActiveImageSrc] = useState(`https://cdn.polyhaven.com/asset_img/primary/${assetID}.png`) // Without height=X, used to highlight active image in carousel
  const [showWebGL, setShowWebGL] = useState(false)
  const [showTilePreview, setShowTilePreview] = useState('')
  const [showDownloadGraph, setShowDownloadGraph] = useStoredState('asset_showDownloadGraph', false)
  const [showAfterDownloadPopup, setShowAfterDownloadPopup] = useState(false)
  const [hideSidebar, setHideSidebar] = useState(true)
  const widthRef = useRef(null)
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

  let vault = null
  for (const cat of data.categories) {
    if (cat.startsWith('vault: ')) {
      vault = cat.split(': ')[1]
      break
    }
  }

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

  useEffect(() => {
    // Handle user loading
    if (uuid) {
      getPatronInfo(uuid).then((resdata) => {
        setPatron(resdata)
      })
    } else {
      if (user) {
        setUuid(user.sub.split('|').pop())
      }
    }
  }, [user, uuid])

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
      src += '?height=760'
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
            <img id="activePreview" onLoad={imageLoaded} src={activeImage} />
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
        <UserRenders assetID={assetID} />
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
              <TagsList
                label={t('categories')}
                list={data.categories}
                linkPrefix={`/${Object.keys(asset_types)[data.type]}/`}
                width={sidebarWidth}
              />
              <TagsList
                label={t('tags')}
                list={data.tags}
                linkPrefix={`/${Object.keys(asset_types)[data.type]}?s=`}
                width={sidebarWidth}
              />
            </div>
            <InfoItem label={t('released')}>
              {vault ? (
                <span style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                  When the{' '}
                  <Link href={`/vaults/${vault}`} prefetch={false}>
                    {titleCase(vault)} Vault
                  </Link>{' '}
                  is unlocked
                </span>
              ) : (
                `${ageValue} ${ageLabel}`
              )}
            </InfoItem>
          </div>
        </div>

        <div className={styles.sidebarAd}>
          <DisplayAd id="assetPage" x={336} y={280} />
        </div>
      </div>
    </div>
  )
}

export default AssetPage
