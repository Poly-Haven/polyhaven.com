import styles from './Popup.module.scss'

const Popup = ({ show, hide, children }) => {
  if (!show) {
    return null
  }

  return (
    <div className={styles.wrapper} onClick={hide}>
      <div className={styles.popup}>
        {children}
        <div className={styles.buttonWrapper}>
          <div className={styles.button}>OK</div>
        </div>
      </div>
    </div>
  )
}

export default Popup
