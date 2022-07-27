import Link from 'next/link';

import styles from './Nav.module.scss'

const NavItem = ({ text, link, locale, compact, children }) => {
  return (
    <div className={`${styles.navItemWrapper} ${compact ? styles.compactNavItemWrapper : ''}`}>
      {link ?
        (locale ?
          <Link href={link} locale={locale} prefetch={false}><a className={styles.navItem}>
            {text}
          </a></Link> :
          <Link href={link}><a className={styles.navItem}>
            {text}
          </a></Link>)
        : <span className={styles.navItem}>{text}</span>}
      {children ?
        <div className={styles.subNav}>{children}</div>
        : null}
    </div>
  )
}

NavItem.defaultProps = {
  children: null,
  link: null,
  locale: null,
  compact: false,
}

export default NavItem
