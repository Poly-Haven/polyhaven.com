import ReactTooltip from 'react-tooltip'

import styles from './Tooltip.module.scss'

const Tooltip = ({ id, place }) => {
  return (
    <ReactTooltip
      id={id}
      place={place}
      delayShow={250}
      multiline
      border
      borderColor="rgba(190, 111, 255, 0.5)"
      backgroundColor="rgb(60, 60, 60)"
      className={styles.tooltip}
    />
  )
}

Tooltip.defaultProps = {
  id: null,
  place: null,
}

export default Tooltip
