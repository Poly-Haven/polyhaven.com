import Avatar from 'components/Avatar/Avatar'

import Heart from 'components/UI/Icons/Heart'

import styles from './SimpleAuthorCredit.module.scss'

const SimpleAuthorCredit = ({ id, size, donated }) => {

  return (
    <div className={styles.author}>
      <Avatar id={id} size={size} />
      <p>{id}</p>
      {donated && <Heart color="#F96854" />}
    </div>
  )
}

SimpleAuthorCredit.defaultProps = {
  size: 24,
  donated: false,
}

export default SimpleAuthorCredit
