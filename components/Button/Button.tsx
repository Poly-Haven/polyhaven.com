import Link from 'next/link';

import styles from './Button.module.scss'

const Button = ({ text, href, color, icon }) => {
  return (
    <Link href={href}><a className={`${styles.button} ${styles[color]}`}>
      <div className={styles.inner}>
        {icon && <div className={styles.icon}>{icon}</div>}
        {text}
      </div>
    </a></Link>
  )
}

Button.defaultProps = {
  color: 'accent',
  icon: null
}

export default Button
