import styles from './IconButton.module.scss'

const IconButton = ({ icon, label, onClick, active, children }) => {
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.button} ${active ? styles.active : ''}`} onClick={onClick}>
        <div className={styles.icon}>{icon}</div>
        {label && <div className={styles.label}>{label}</div>}
      </div>
      {children ? <div className={styles.menu}>{children}</div> : null}
    </div>
  )
}
IconButton.defaultProps = {
  label: null,
  active: false,
  onClick: null,
  children: null,
}

export default IconButton
