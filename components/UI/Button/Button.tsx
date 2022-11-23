import Link from 'next/link'

import styles from './Button.module.scss'

const Button = ({ text, href, color, icon, style }) => {
  return (
    <Link href={href}>
      <a className={`${styles.button} ${styles[color]}`} style={style}>
        <div className={styles.inner}>
          {icon && <div className={styles.icon}>{icon}</div>}
          {text}
        </div>
      </a>
    </Link>
  )
}

Button.defaultProps = {
  color: 'accent',
  icon: null,
  style: null,
}

export default Button
