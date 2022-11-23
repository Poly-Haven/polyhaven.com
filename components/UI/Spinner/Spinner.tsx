import styles from './Spinner.module.scss'

const Spinner = (props) => {
  return (
    <div className={`${styles.spinnerWrapper} ${props.className || ''}`}>
      <div className={styles.spinner}></div>
    </div>
  )
}

export default Spinner
