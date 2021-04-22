import Page from 'components/Layout/Page/Page'
import AdAssetSidebar from 'components/Ads/AssetSidebar'

import styles from './AssetPage.module.scss'

const AssetPage = ({ assetID, data }) => {
  return (
    <div className={styles.wrapper}>
      <Page>
        <h1>{data.name}</h1>
        <p>by {Object.keys(data.authors).join(', ')}</p>
      </Page>
      <div className={styles.sidebar}>
        <div className={styles.info}>
          <h2>Download</h2>
        </div>
        <div className={styles.sidebarAd}><AdAssetSidebar /></div>
      </div>
    </div>
  )
}

export default AssetPage
