import { Tooltip as ReactTooltip } from 'react-tooltip'

import styles from './Tooltip.module.scss'

const Tooltip = ({ id, place }) => {
  return (
    <ReactTooltip
      id={id}
      place={place}
      delayShow={250}
      className={styles.tooltip}
      classNameArrow={styles.arrow}
      float
      positionStrategy={'fixed'}
    />
  )
}

Tooltip.defaultProps = {
  id: null,
  place: null,
}

export default Tooltip
