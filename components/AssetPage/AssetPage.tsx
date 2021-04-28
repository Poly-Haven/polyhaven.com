import { MdFileDownload } from 'react-icons/md'

import Page from 'components/Layout/Page/Page'
import AdAssetSidebar from 'components/Ads/AssetSidebar'
import Todo from 'components/Todo/Todo'
import AuthorCredit from 'components/AuthorCredit/AuthorCredit'

import styles from './AssetPage.module.scss'

const AssetPage = ({ assetID, data }) => {
  const ext = {
    0: 'jpg',
    1: 'png',
    2: 'png'
  }
  const authors = Object.keys(data.authors)
  const multiAuthor = authors.length > 1;
  return (
    <div className={styles.wrapper}>
      <Page immersiveScroll={true}>
        <div className={styles.header}>
          <h1>{data.name}</h1>
          <div className={styles.spacer} />
          <div className={styles.authors}>
            Author{multiAuthor ? "s" : ""}:
            {authors.map(a => <AuthorCredit id={a} key={a} credit={multiAuthor ? data.authors[a] : ""} />)}
          </div>
        </div>
        <div className={styles.previewWrapper}>
          <div className={styles.carousel}><Todo>Image carousel</Todo></div>
          <div className={styles.activePreview}>
            <img src={`https://cdn.polyhaven.com/asset_img/primary/${assetID}.${ext[data.type]}?width=1439&sharpen=true`} />
          </div>
        </div>
        <Todo />
      </Page>
      <div className={styles.sidebar}>
        <div className={styles.info}>
          <h2>Info</h2>
        </div>
        <div id="download-btn" className={styles.downloadBtn}>
          <MdFileDownload />
            Download
          </div>
        <div className={styles.sidebarAd}><AdAssetSidebar /></div>
      </div>
    </div>
  )
}

export default AssetPage
