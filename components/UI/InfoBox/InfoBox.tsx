import styles from './InfoBox.module.scss'

import { MdInfo } from 'react-icons/md'

const InfoBox = ({ type, header, children }) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.header}>
        <MdInfo />
        {header}
      </p>
      {children}
    </div>
  )
}

export default InfoBox
