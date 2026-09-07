import styles from './Avatar.module.scss'
import { placeholderAvatar } from 'utils/placeholderAvatar'
import { useSiteImg } from 'contexts/ImageVersionsContext'

const Avatar = ({ id, size }) => {
  const siteImg = useSiteImg()
  return (
    <img
      src={siteImg(`people/${id}.jpg`, { width: size, quality: 95 })}
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
