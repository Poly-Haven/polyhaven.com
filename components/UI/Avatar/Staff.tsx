import Link from 'next/link'

import CountryFlag from 'components/UI/Icons/CountryFlag'

import styles from './Avatar.module.scss'

const Staff = ({ id, name, role, country, mode }) => {
  const size = 150

  return (
    <div className={styles.staffAvatar}>
      <Link href={`/all?a=${id}`}>

        <img src={`https://cdn.polyhaven.com/people/${id}.jpg?width=${size}`} width={size} height={size} />

      </Link>
      <div className={`${styles.staffInfo} ${mode === 'compact' ? styles.staffInfoCompact : null}`}>
        <CountryFlag code={country} />
        <strong>{name}</strong>
        <br />
        <em>{role}</em>
      </div>
    </div>
  );
}

export default Staff
