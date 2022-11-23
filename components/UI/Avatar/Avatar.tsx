import styles from './Avatar.module.scss'
import { placeholderAvatar } from 'utils/placeholderAvatar'

const Avatar = ({ id, size }) => {
  return (
    <img
      src={`https://cdn.polyhaven.com/people/${id}.jpg?width=${size}`}
      width={size}
      height={size}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.src = placeholderAvatar(id, size)
      }}
      className={styles.avatar}
    />
  )
}

export default Avatar
