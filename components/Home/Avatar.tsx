import CountryFlag from 'components/UI/Icons/CountryFlag'
import { useSiteImg } from 'contexts/ImageVersionsContext'

import styles from './Home.module.scss'

const Avatar = ({ id, name, role, country }) => {
  const siteImg = useSiteImg()
  const size = 150

  return (
    <div className={styles.avatar}>
      <img src={siteImg(`people/${id}.jpg`, { width: size, quality: 95 })} width={size} height={size} />
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
