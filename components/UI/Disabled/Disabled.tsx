import Tooltip from 'components/Tooltip/Tooltip';

import styles from './Disabled.module.scss'

const Disabled = ({ disabled, tooltip, tooltipSide, style, children }) => {
  if (!disabled) {
    return children;
  }
  return (
    <div className={styles.disabled} data-tip={tooltip} style={style}>
      <div className={styles.contents}>
        {children}
      </div>
      <Tooltip place={tooltipSide} />
    </div>
  )
}

Disabled.defaultProps = {
  disabled: true,
  style: {},
  tooltip: null,
  tooltipSide: null
}

export default Disabled
