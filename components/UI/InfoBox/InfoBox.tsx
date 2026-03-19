import styles from './InfoBox.module.scss'

const InfoBox = ({ type, header, icon, side = null, children = null }) => {
  return (
    <div className={`${styles.wrapper} ${styles[type]}`}>
      <div>
        <p className={styles.header}>
          {icon}
          {header}
        </p>
        {children}
      </div>
      {side && <div className={styles.side}>{side}</div>}
    </div>
  )
}

export default InfoBox
