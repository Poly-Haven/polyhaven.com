import styles from './Loader.module.scss'

const Loader = (inline) => {
  return (
    <span className={inline ? styles.inlineWrapper : styles.wrapper}>
      <span className={styles.loader}></span>
    </span>
  )
}

Loader.defaultProps = {
  inline: false,
}

export default Loader
