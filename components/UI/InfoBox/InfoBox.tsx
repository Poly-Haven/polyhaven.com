import styles from './InfoBox.module.scss'

const InfoBox = ({ type, header, icon, side, children }) => {
  return (
    <div className={`${styles.wrapper} ${styles[type]}`}>
      <div>
        <p className={styles.header}>
          {icon}
          {header}
        </p>
        {children}
      </div>
      <div className={styles.side}>{side}</div>
    </div>
  )
}

export default InfoBox
