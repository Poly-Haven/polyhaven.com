import Button from 'components/Button/Button';
import Tooltip from 'components/Tooltip/Tooltip';

import styles from './TierBlock.module.scss'

const TierBlock = ({ title, image, price, link, numExisting, limit, features }) => {
  const disableButton = limit && numExisting >= limit
  return (
    <div className={styles.wrapper}>
      {image && <div className={styles.image}>{image}</div>}
      <h2>{title}</h2>
      <h3>
        <strong>${price}</strong>/month {limit && <span>
          <br />
          Limited: {Math.max(0, limit - numExisting)} of {limit} remaining
        </span>}
      </h3>
      <div className={styles.features}>
        {features.map((f, k) => <div key={k} className={styles.feat}>
          <div className={styles.featIcon} style={{ color: f.color || 'inherit' }}>{f.icon}</div>
          <div className={styles.featText}>{f.text}</div>
        </div>)}
      </div>
      {disableButton ? <p style={{ fontStyle: 'italic', opacity: 0.7, textAlign: 'center' }}>No slots remaining, sorry!</p> :
        <Button text="Sign Up" href={link} style={{ margin: 0 }} />
      }
      <Tooltip />
    </div>
  )
}
TierBlock.defaultProps = {
  image: null,
  numExisting: 0,
  limit: null,
}

export default TierBlock
