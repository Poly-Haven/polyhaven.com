import timeago from 'epoch-timeago';

import styles from './Avatar.module.scss'

const Avatar = ({ name, image, size, timestamp }) => {
  return (
    <div className={styles.patron}>
      <img
        src={image}
        width={size}
        height={size}
        className={styles.avatar}
      />
      <p>
        <strong>{name}</strong><br />
        <span>{timeago(timestamp)}</span>
      </p>
    </div>
  )
}

export default Avatar
