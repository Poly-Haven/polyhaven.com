import styles from './DownloadOptions.module.scss'

const Download = ({ open }) => {
  return (
    <div className={styles.wrapper}>
      <div id='download_options' className={`${styles.optionsWrapper} ${!open ? styles.optionsHidden : null}`}>
        Hello!
      </div>
    </div>
  )
}

export default Download
