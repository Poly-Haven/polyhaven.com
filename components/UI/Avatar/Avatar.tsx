import styles from './Avatar.module.scss'
import { placeholderAvatar } from 'utils/placeholderAvatar'
import { useSiteImg } from 'contexts/ImageVersionsContext'

const Avatar = ({ id, size, alt = id }: { id: string; size: number; alt?: string }) => {
  const siteImg = useSiteImg()
  return (
    <img
      src={siteImg(`people/${id}.jpg`, { width: size, quality: 95 })}
      width={size}
      height={size}
      alt={alt}
      onError={(e) => {
        const target = e.target as HTMLImageElement
        // Once only: if the placeholder fails too (offline, or a blocker), setting it again would
        // retry forever - thousands of requests a second.
        target.onerror = null
        target.src = placeholderAvatar(id, size)
      }}
      className={styles.avatar}
    />
  )
}

export default Avatar
