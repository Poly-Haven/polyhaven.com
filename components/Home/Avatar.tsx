import CountryFlag from 'components/UI/Icons/CountryFlag'

import styles from './Home.module.scss'

const Avatar = ({ id, name, role, country }) => {
  const size = 150

  return (
    <div className={styles.avatar}>
      <img src={`https://cdn.polyhaven.com/people/${id}.jpg?width=${size}`} width={size} height={size} />
      <div className={styles.avatarInfo}>
        <CountryFlag code={country} />
        <strong>{name}</strong>
        <br />
        <em>{role}</em>
      </div>
    </div>
  )
}

export default Avatar
