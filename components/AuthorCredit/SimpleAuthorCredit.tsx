import Avatar from 'components/Avatar/Avatar'

import styles from './SimpleAuthorCredit.module.scss'

const SimpleAuthorCredit = ({ id, size }) => {

  return (
    <div className={styles.author}>
      <Avatar id={id} size={size} />
      <p>{id}</p>
    </div>
  )
}

SimpleAuthorCredit.defaultProps = {
  size: 24,
}

export default SimpleAuthorCredit
