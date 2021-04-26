import Link from 'next/link';

import styles from './Button.module.scss'

const Button = ({ text, href, color }) => {
  return (
    <Link href={href}><a className={`${styles.button} ${styles[color]}`}>
      {text}
    </a></Link>
  )
}

Button.defaultProps = {
  color: 'accent'
}

export default Button
