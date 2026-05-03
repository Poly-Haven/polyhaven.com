import Link from 'next/link'

import styles from './Button.module.scss'

const Button = ({ text, href, color, icon, style, ariaLabel }) => {
  return (
    (<Link href={href} className={`${styles.button} ${styles[color]}`} style={style} aria-label={ariaLabel}>

      <div className={styles.inner}>
        {icon && <div className={styles.icon}>{icon}</div>}
        {text}
      </div>

    </Link>)
  );
}

Button.defaultProps = {
  color: 'accent',
  icon: null,
  style: null,
  ariaLabel: null,
}

export default Button
