import styles from './StatBlock.module.scss'

const StatBlock = ({ head, text }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <h4>{head}</h4>
        <p>{text}</p>
      </div>
    </div>
  )
}

export default StatBlock
