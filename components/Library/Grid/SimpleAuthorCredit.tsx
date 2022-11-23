import Avatar from 'components/UI/Avatar/Avatar'

import Heart from 'components/UI/Icons/Heart'

import styles from './SimpleAuthorCredit.module.scss'

const SimpleAuthorCredit = ({ id, size, donated, short }) => {
  return (
    <div className={styles.author}>
      <Avatar id={id} size={size} />
      <p>{short ? id.split(' ')[0] : id}</p>
      {donated && <Heart color="#F96854" />}
    </div>
  )
}

SimpleAuthorCredit.defaultProps = {
  size: 24,
  donated: false,
  short: false,
}

export default SimpleAuthorCredit
