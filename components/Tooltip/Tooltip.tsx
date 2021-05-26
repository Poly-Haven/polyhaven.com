import ReactTooltip from 'react-tooltip'

import styles from './Tooltip.module.scss'

const Tooltip = ({ id }) => {
  return (
    <ReactTooltip id={id} multiline border borderColor="rgba(190, 111, 255, 0.5)" backgroundColor="rgb(60, 60, 60)" className={styles.tooltip} />
  )
}

Tooltip.defaultProps = {
  id: null
}

export default Tooltip
