import { useTranslation } from 'next-i18next';
import { timeago } from 'utils/dateUtils';
import { stringHash } from 'utils/stringUtils'

import styles from './Avatar.module.scss'

const Avatar = ({ name, size, timestamp }) => {
  const numImages = 333
  const imgIndex = Math.abs(stringHash(name) % numImages)
  const avatar = `https://cdn.polyhaven.com/site_images/owls/${imgIndex.toString().padStart(3, '0')}.png?width=36`

  const { t } = useTranslation('time');
  return (
    <div className={styles.patron}>
      <img
        src={avatar}
        width={size}
        height={size}
        className={styles.avatar}
      />
      <p>
        <strong>{name}</strong><br />
        <span>{timeago(timestamp, t)}</span>
      </p>
    </div>
  )
}

export default Avatar
