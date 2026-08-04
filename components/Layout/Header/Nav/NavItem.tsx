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
  open = null,
  onToggle = null,
}) => {
  // Only used on mobile, where the desktop :hover reveal has no touch equivalent.
  const [selfExpanded, setSelfExpanded] = useState(false)
  const labelId = useId()

  // `onToggle` switches the item to controlled mode, for submenus whose open
  // state the parent has to coordinate with other overlays (the locale panel).
  const controlled = onToggle !== null
  const expanded = controlled ? open : selfExpanded

  const toggleExpanded = (e) => {
    e.preventDefault()
    e.stopPropagation() // don't let the nav's close-on-click handler dismiss the whole menu
    if (controlled) onToggle()
    else setSelfExpanded(!selfExpanded)
  }

  // An item with a submenu but no destination of its own is its own toggle,
  // rather than getting a separate chevron.
  const rowIsToggle = Boolean(children) && !link

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
      ) : rowIsToggle ? (
        <button
          type="button"
          className={styles.navItem}
          id={labelId}
          aria-expanded={Boolean(expanded)}
          onClick={toggleExpanded}
        >
          {text}
        </button>
      ) : (
        <span className={styles.navItem} id={labelId}>
          {text}
        </span>
      )}
      {children ? (
        <>
          {rowIsToggle ? null : (
            <button
              type="button"
              className={styles.expandToggle}
              aria-expanded={Boolean(expanded)}
              aria-labelledby={labelId}
              onClick={toggleExpanded}
            >
              <MdExpandMore />
            </button>
          )}
          <div className={styles.subNav}>{children}</div>
        </>
      ) : null}
    </div>
  )
}

export default NavItem
