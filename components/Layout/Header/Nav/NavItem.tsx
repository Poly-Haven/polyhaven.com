import Link from 'next/link'

import styles from './Nav.module.scss'

const NavItem = ({ text, link, locale, compact, children }) => {
  return (
    <div
      className={`${styles.navItemWrapper} ${compact ? styles.compactNavItemWrapper : ''} ${
        children ? styles.navItemMenuFlag : ''
      }`}
    >
      {link ? (
        locale ? (
          <a href={`${locale === 'en' ? '' : `/${locale}`}${link}`} className={styles.navItem}>
            {text}
          </a>
        ) : (
          <Link href={link} className={styles.navItem}>
            {text}
          </Link>
        )
      ) : (
        <span className={styles.navItem}>{text}</span>
      )}
      {children ? <div className={styles.subNav}>{children}</div> : null}
    </div>
  );
}

NavItem.defaultProps = {
  children: null,
  link: null,
  locale: null,
  compact: false,
}

export default NavItem
