import { useTranslation } from 'next-i18next'
import { timeago } from 'utils/dateUtils'

import styles from './Avatar.module.scss'

const Avatar = ({ name, size, timestamp }) => {
  const avatar = `https://cats.polyhaven.org/api/cat?name=${name}`

  const { t } = useTranslation('time')
  return (
    <div className={styles.patron}>
      <img src={avatar} width={size} height={size} />
      <p>
        <strong>{name}</strong>
        <br />
        <span>{timeago(timestamp, t)}</span>
      </p>
    </div>
  )
}

export default Avatar
