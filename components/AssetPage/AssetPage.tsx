import styles from './AssetPage.module.scss'
import Footer from 'components/Footer/Footer'

const AssetPage = ({ assetID, data }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.pageWrapper}>
        <div className={styles.page}>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
          <h1>{data.name}</h1>
          <p>by {Object.keys(data.authors).join(',')}</p>
        </div>
        <Footer />
      </div>
      <div className={styles.sidebar}>
        Download
      </div>
    </div>
  )
}

export default AssetPage
