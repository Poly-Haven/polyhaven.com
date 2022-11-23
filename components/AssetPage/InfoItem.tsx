import styles from './AssetPage.module.scss'

const InfoItem = ({ label, condition, flex, children }) => {
  if (condition) {
    return (
      <span className={`${styles.infoItem} ${flex ? styles.flex : null}`}>
        <strong>{label}: </strong>
        {children}
      </span>
    )
  } else {
    return null
  }
}

InfoItem.defaultProps = {
  condition: true,
  flex: false,
}

export default InfoItem
