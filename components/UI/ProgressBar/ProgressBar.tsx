import { MdArrowUpward } from 'react-icons/md'

import IconPatreon from 'components/UI/Icons/Patreon'

import styles from './ProgressBar.module.scss'

const ProgressBar = ({ progress1, progress2, label, labelValue, mode, tooltipLabel, tooltip1, tooltip2 }) => {
  return (
    <div className={`${styles.barWrapper} ${mode === 'small' ? styles.small : ''}`}>
      <div data-tip={tooltipLabel} className={styles.barOuter}>
        <div className={styles.barInnerWrapper}>
          <div data-tip={mode === 'big' ? tooltip1 : null} className={styles.barInner} style={{ width: `${progress1}%` }}>
            {mode !== 'big' ? <div className={styles.innerText}><IconPatreon />{label}</div> : null}
          </div>
          {mode === 'big' ? <div data-tip={tooltip2} className={styles.barInner} style={{ width: `${progress2}%` }} /> : null}
        </div>
      </div>
      {mode === 'big' ? <div data-tip={tooltipLabel} className={styles.label}>{label} <strong>{labelValue}</strong><MdArrowUpward /></div> : null}
    </div>
  )
}

ProgressBar.defaultProps = {
  progress1: 0,
  progress2: 0,
  label: "Current goal:",
  labelValue: null,
  tooltipLabel: null,
  tooltip1: null,
  tooltip2: null
}

export default ProgressBar
