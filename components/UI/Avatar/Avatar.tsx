import styles from './Avatar.module.scss'

const Avatar = ({ id, size }) => {
  return (
    <img
      src={`https://cdn.polyhaven.com/people/${id}.jpg?width=${size}`}
      width={size}
      height={size}
      onError={e => {
        const target = e.target as HTMLImageElement;
        target.src = `https://cdn.polyhaven.com/people/fallback.png?width=${size}`
      }}
      className={styles.avatar}
    />
  )
}

export default Avatar
