import { useState } from 'react'
import { useEffect } from "react";
import Link from 'next/link';
import Markdown from 'markdown-to-jsx';
import { trackWindowScroll } from 'react-lazy-load-image-component';

import asset_types from 'constants/asset_types.json'
import asset_type_names from 'constants/asset_type_names.json'

import Page from 'components/Layout/Page/Page'
import AdAssetSidebar from 'components/Ads/AssetSidebar'
import AuthorCredit from 'components/AuthorCredit/AuthorCredit'
import Spinner from 'components/Spinner/Spinner'
import Heart from 'components/Heart/Heart'
import Carousel from './Carousel/Carousel'
import Download from './Download/Download'
import Similar from './Similar/Similar'
import InfoItem from './InfoItem'
import Sponsor from './Sponsor'
import GLTFViewer from './WebGL/GLTFViewer'

import styles from './AssetPage.module.scss'

const AssetPage = ({ assetID, data, scrollPosition }) => {
  const [pageLoading, setPageLoading] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [showWebGL, setShowWebGL] = useState(true)

  const authors = Object.keys(data.authors).sort()
  const multiAuthor = authors.length > 1;

  useEffect(() => {
    document.getElementById('header-title').innerHTML = data.name
    let path = document.getElementById('header-frompath').innerHTML
    if (!path) {
      path = `<a href="/${Object.keys(asset_types)[data.type]}">${asset_type_names[data.type]}s</a> /`
    }
    document.getElementById('header-path').innerHTML = path
    document.getElementById('header-frompath').innerHTML = ""
    document.getElementById('page').scrollTop = 0
  });

  const clickSimilar = () => {
    setPageLoading(true)
    setShowWebGL(false)
  }

  const setPreviewImage = (src) => {
    setImageLoading(true)
    document.getElementById('activePreview').setAttribute('src', src + "?height=780");
  }
  const imageLoaded = (e) => {
    setImageLoading(false)
    setPageLoading(false)
    setShowWebGL(false)
  }

  const clickShowWebGL = _ => {
    setShowWebGL(true)
  }

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.loading} ${!pageLoading ? styles.hidden : null}`}>
        <Spinner />
      </div>
      <Page immersiveScroll={true}>
        <div id="preview-container" className={styles.previewWrapper}>
          <div className={styles.activePreview}>
            <img
              id="activePreview"
              onLoad={imageLoaded}
              src={`https://cdn.polyhaven.com/asset_img/primary/${assetID}.png?height=780`}
            />
            <GLTFViewer show={showWebGL} assetID={assetID} />
            <div className={`${styles.loading} ${!imageLoading ? styles.hidden : null}`}>
              <Spinner />
            </div>
          </div>
          <div className={styles.carousel}>
            <Carousel slug={assetID} assetType={data.type} setter={setPreviewImage} showWebGL={clickShowWebGL} />
          </div>
        </div>
        <div className={styles.similar}>
          <h2>Similar Assets:</h2>
          <Similar slug={assetID} scrollPosition={scrollPosition} onClick={clickSimilar} />
        </div>
      </Page>

      <div className={styles.sidebar}>

        <div className={styles.info}>

          <Download assetID={assetID} data={data} setPreview={setPreviewImage} />

          <InfoItem label={`${multiAuthor ? "Authors" : "Author"}`} flex>
            <div className={styles.authors}>
              {authors.map(a => <AuthorCredit id={a} key={a} credit={multiAuthor ? data.authors[a] : ""} />)}
            </div>
            {data.donated ? <div className={styles.heart} title="This asset was donated to Poly Haven freely by the author :)"><Heart /></div> : null}
          </InfoItem>

          {data.info ? <div>
            <div className={styles.infoText} lang="en">
              <Markdown>{data.info.replace(/\\n/g, '\n')}</Markdown>
            </div>
          </div> : null}

          <InfoItem label="License">
            <Link href="/license">CC0</Link> (public domain)
          </InfoItem>
          <InfoItem label="Published">
            {new Date(data.date_published * 1000).toLocaleDateString("en-ZA")}
          </InfoItem>
          <InfoItem label="Dynamic Range" condition={Boolean(data.evs_cap)}>
            {data.evs_cap} <Link href="/faq#stops">EVs</Link>, unclipped
          </InfoItem>
          <InfoItem label="Scale" condition={Boolean(data.scale)}>
            {data.scale}
          </InfoItem>
          <InfoItem label="Captured" condition={Boolean(data.date_taken)}>
            {new Date(data.date_taken * 1000).toLocaleString("en-ZA")}
          </InfoItem>
          <InfoItem label="Location" condition={Boolean(data.coords)}>
            {data.coords ? data.coords.join(', ') : null}
          </InfoItem>
          <InfoItem label="Whitebalance" condition={Boolean(data.whitebalance)}>
            {data.whitebalance}K
          </InfoItem>
          <InfoItem label="Downloads" condition={Boolean(data.download_count)}>
            {data.download_count}
          </InfoItem>

          <div className={styles.spacer} />
          <Sponsor assetID={assetID} sponsors={data.sponsors} />
          <div className={styles.spacer} />

          <InfoItem label="Categories">
            <div className={styles.tagsList}>
              {data.categories.map(i =>
                <Link href={`/${Object.keys(asset_types)[data.type]}/${i}`} key={i}><a>
                  <div className={styles.tag}>{i}</div>
                </a></Link>
              )}
            </div>
          </InfoItem>
          <InfoItem label="Tags">
            <div className={styles.tagsList}>
              {data.tags.map(i =>
                <Link href={`/${Object.keys(asset_types)[data.type]}?s=${i}`} key={i}><a>
                  <div className={styles.tag}>{i}</div>
                </a></Link>
              )}
            </div>
          </InfoItem>
        </div>

        <div className={styles.sidebarAd}><AdAssetSidebar /></div>
      </div>
    </div>
  )
}

export default trackWindowScroll(AssetPage)
