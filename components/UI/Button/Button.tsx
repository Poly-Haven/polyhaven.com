import Link from 'next/link'

import styles from './Button.module.scss'

const Button = ({ text, href, color, icon, style, onClick }) => {
  // Spans, not divs: <button> takes phrasing content only, and this renders one without an href.
  const inner = (
    <span className={styles.inner}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {text}
    </span>
  )
  const className = `${styles.button} ${styles[color]}`

  // Not every button navigates - the asset page's "More" expands a list in place. Link with no
  // href renders an <a> with href={undefined}: styled like a button, and inert.
  if (!href) {
    return (
      <button type="button" className={className} style={style} onClick={onClick}>
        {inner}
      </button>
    )
  }

  return (
    <Link href={href} className={className} style={style} onClick={onClick}>
      {inner}
    </Link>
  )
}

Button.defaultProps = {
  href: null,
  color: 'accent',
  icon: null,
  style: null,
  onClick: null,
}

export default Button
