import styles from './Home.module.scss'

const Avatar = ({ id, name, role }) => {
  const size = 150;

  return (
    <div className={styles.avatar}>
      <img
        src={`https://cdn.polyhaven.com/people/${id}.jpg?width=${size}`}
        width={size}
        height={size}
      />
      <div className={styles.avatarInfo}><strong>{name}</strong><br /><em>{role}</em></div>
    </div>
  )
}

export default Avatar
