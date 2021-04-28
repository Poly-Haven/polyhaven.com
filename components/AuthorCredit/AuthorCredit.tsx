import Avatar from 'components/Avatar/Avatar'

import styles from './AuthorCredit.module.scss'

const AuthorCredit = ({ id, size, credit }) => {
  return (
    <div className={styles.author}>
      <div className={styles.avatar}>
        <Avatar id={id} size={50} />
      </div>
      <div className={styles.name}>
        <strong>{id}</strong>
        {credit ? <span className={styles.credit}>{credit}</span> : ""}
      </div>
    </div>
  )
}

AuthorCredit.defaultProps = {
  size: "small",
  credit: ""
}

export default AuthorCredit
