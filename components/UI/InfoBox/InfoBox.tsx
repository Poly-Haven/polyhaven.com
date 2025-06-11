import styles from './InfoBox.module.scss'

import { MdInfo } from 'react-icons/md'

const InfoBox = ({ type, header, side, children }) => {
  return (
    <div className={styles.wrapper}>
      <div>
        <p className={styles.header}>
          <MdInfo />
          {header}
        </p>
        {children}
      </div>
      <div className={styles.side}>{side}</div>
    </div>
  )
}

export default InfoBox
