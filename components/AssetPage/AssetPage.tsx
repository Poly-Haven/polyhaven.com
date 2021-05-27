import { useEffect } from "react";
import Link from 'next/link';

import { MdFileDownload } from 'react-icons/md'

import asset_types from 'constants/asset_types.json'
import asset_type_names from 'constants/asset_type_names.json'

import Page from 'components/Layout/Page/Page'
import AdAssetSidebar from 'components/Ads/AssetSidebar'
import Todo from 'components/Todo/Todo'
import AuthorCredit from 'components/AuthorCredit/AuthorCredit'
import InfoItem from './InfoItem'
import Sponsor from './Sponsor'

import styles from './AssetPage.module.scss'

const AssetPage = ({ assetID, data }) => {
  const ext = {
    0: 'jpg',
    1: 'png',
    2: 'png'
  }
  const authors = Object.keys(data.authors)
  const multiAuthor = authors.length > 1;

  useEffect(() => {
    document.getElementById('header-title').innerHTML = data.name
    let path = document.getElementById('header-frompath').innerHTML
    if (!path) {
      path = `<a href="/${Object.keys(asset_types)[data.type]}">${asset_type_names[data.type]}s</a> /`
    }
    document.getElementById('header-path').innerHTML = path
    document.getElementById('header-frompath').innerHTML = ""
  });

  return (
    <div className={styles.wrapper}>
      <Page immersiveScroll={true}>
        <div className={styles.previewWrapper}>
          <div className={styles.activePreview}>
            <img src={`https://cdn.polyhaven.com/asset_img/primary/${assetID}.${ext[data.type]}?width=1559`} />
          </div>
          <div className={styles.carousel}><Todo>Image carousel</Todo></div>
        </div>
        <Todo>Backplates, similar assets, user renders</Todo>
      </Page>

      <div className={styles.sidebar}>

        <div className={styles.info}>
          <InfoItem label="Author" flex>
            <div className={styles.authors}>
              {authors.map(a => <AuthorCredit id={a} key={a} credit={multiAuthor ? data.authors[a] : ""} />)}
            </div>
          </InfoItem>
          <InfoItem label="License">
            <Link href="/license">CC0</Link> (public domain)
          </InfoItem>
          <InfoItem label="Published">
            {new Date(data.date_published * 1000).toLocaleDateString("en-ZA")}
          </InfoItem>
          <InfoItem label="Dynamic Range" condition={data.evs_cap !== undefined}>
            {data.evs_cap} <Link href="/faq#stops">EVs</Link>, unclipped
          </InfoItem>
          <InfoItem label="Scale" condition={data.scale !== undefined}>
            {data.scale}
          </InfoItem>
          <InfoItem label="Captured" condition={data.date_taken !== undefined}>
            {new Date(data.date_taken * 1000).toLocaleString("en-ZA")}
          </InfoItem>
          <InfoItem label="Location" condition={data.coords !== undefined}>
            {data.coords ? data.coords.join(', ') : null}
          </InfoItem>
          <InfoItem label="Whitebalance" condition={data.whitebalance !== undefined}>
            {data.whitebalance}K
          </InfoItem>
          <InfoItem label="Downloads">
            {data.download_count}
          </InfoItem>

          <div className={styles.spacer} />
          <Sponsor assetID={assetID} sponsors={data.sponsors} />
          <div className={styles.spacer} />

          <div id="download-btn" className={styles.downloadBtn}>
            <MdFileDownload />
            Download
          </div>

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

export default AssetPage
