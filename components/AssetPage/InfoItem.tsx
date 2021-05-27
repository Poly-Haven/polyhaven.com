
import styles from './AssetPage.module.scss'

const InfoItem = ({ label, condition, children }) => {
  if (condition) {
    return (
      <span className={styles.infoItem}>
        <strong>{label}: </strong>{children}
      </span>
    )
  } else {
    return null
  }
}

export default InfoItem
