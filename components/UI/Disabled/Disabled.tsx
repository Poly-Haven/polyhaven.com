import styles from './Disabled.module.scss'

const Disabled = ({ disabled, tooltip, tooltipSide, style, children }) => {
  if (!disabled) {
    return children
  }
  return (
    <div className={styles.disabled} data-tip={tooltip} data-place={tooltipSide} style={style}>
      <div className={styles.contents}>{children}</div>
    </div>
  )
}

Disabled.defaultProps = {
  disabled: true,
  style: {},
  tooltip: null,
  tooltipSide: null,
}

export default Disabled
