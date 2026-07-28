import Link from 'next/link'
import { useId, useState } from 'react'

import { MdExpandMore } from 'react-icons/md'

import styles from './Nav.module.scss'

const NavItem = ({
  text,
  link = null,
  locale = null,
  compact = false,
  onMouseEnter = null,
  children = null,
  lighthouse = false,
}) => {
  // Only used on mobile, where the desktop :hover reveal has no touch equivalent.
  const [expanded, setExpanded] = useState(false)
  const labelId = useId()

  const toggleExpanded = (e) => {
    e.preventDefault()
    e.stopPropagation() // don't let the nav's close-on-click handler dismiss the whole menu
    setExpanded(!expanded)
  }

  return (
    <div
      className={`${styles.navItemWrapper} ${compact ? styles.compactNavItemWrapper : ''} ${
        children ? styles.navItemMenuFlag : ''
      } ${lighthouse ? styles.lighthouseNavItem : ''} ${expanded ? styles.expanded : ''}`}
      onMouseEnter={onMouseEnter}
    >
      {link ? (
        locale ? (
          <a href={`${locale === 'en' ? '' : `/${locale}`}${link}`} className={styles.navItem} id={labelId}>
            {text}
          </a>
        ) : (
          <Link href={link} className={styles.navItem} id={labelId}>
            {text}
          </Link>
        )
      ) : (
        <span className={styles.navItem} id={labelId}>
          {text}
        </span>
      )}
      {children ? (
        <>
          <button
            type="button"
            className={styles.expandToggle}
            aria-expanded={expanded}
            aria-labelledby={labelId}
            onClick={toggleExpanded}
          >
            <MdExpandMore />
          </button>
          <div className={styles.subNav}>{children}</div>
        </>
      ) : null}
    </div>
  )
}

export default NavItem
