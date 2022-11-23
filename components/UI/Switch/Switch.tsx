import { MdCheck, MdClose } from 'react-icons/md'

import styles from './Switch.module.scss'

const Switch = ({ on, onClick, labelOn, labelOff }) => {
  return (
    <div onClick={onClick} className={styles.wrapper}>
      <div className={`${styles.toggle} ${on ? styles.on : ''}`} />
      <div className={`${styles.label} ${!on ? styles.sel : ''}`}>{labelOff}</div>
      <div className={`${styles.label} ${on ? styles.sel : ''}`}>{labelOn}</div>
    </div>
  )
}

Switch.defaultProps = {
  labelOn: <MdCheck />,
  labelOff: <MdClose />,
}

export default Switch
