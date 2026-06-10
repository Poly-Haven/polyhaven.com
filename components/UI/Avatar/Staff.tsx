import Link from 'next/link'

import CountryFlag from 'components/UI/Icons/CountryFlag'

import styles from './Avatar.module.scss'

const Staff = ({ id, name, role, country, link = null, mode }) => {
  const size = 150

  return (
    <div className={styles.staffAvatar}>
      <Link href={link || `/all?a=${id}`} target="_blank" rel={link ? 'noopener noreferrer' : undefined}>
        <img src={`https://cdn.polyhaven.com/people/${id}.jpg?width=${size}&quality=95`} width={size} height={size} />
      </Link>
      <div className={`${styles.staffInfo} ${mode === 'compact' ? styles.staffInfoCompact : null}`}>
        <span lang="en" dir="ltr">
          <CountryFlag code={country} />
          <strong>{name}</strong>
        </span>
        <br />
        <em>{role}</em>
      </div>
    </div>
  )
}

export default Staff
