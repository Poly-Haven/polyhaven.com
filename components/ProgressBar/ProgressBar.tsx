import { MdArrowUpward } from 'react-icons/md'

import styles from './ProgressBar.module.scss'

const ProgressBar = ({ progress, label, labelValue }) => {
  return (
    <div className={styles.barWrapper}>
      <div className={styles.barOuter}>
        <div className={styles.barInnerWrapper}>
          <div className={styles.barInner} style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      {label ? <div className={styles.label}>{label}: <strong>{labelValue}</strong><MdArrowUpward /></div> : null}
    </div>
  )
}

ProgressBar.defaultProps = {
  label: null,
  labelValue: null
}

export default ProgressBar
