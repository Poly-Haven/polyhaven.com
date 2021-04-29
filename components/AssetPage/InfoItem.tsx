
import styles from './AssetPage.module.scss'

const InfoItem = ({ label, condition, children }) => {
  if (condition) {
    return (
      <p className={styles.infoItem}>
        <strong>{label}: </strong>{children}
      </p>
    )
  } else {
    return null
  }
}

export default InfoItem
