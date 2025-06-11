import styles from './Loader.module.scss'

const Loader = () => {
  return (
    <span className={styles.wrapper}>
      <span className={styles.loader}></span>
    </span>
  )
}

export default Loader
