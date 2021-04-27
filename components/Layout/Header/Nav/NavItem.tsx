import Link from 'next/link';

import styles from './Nav.module.scss'

const NavItem = ({ text, link, children }) => {
  return (
    <div className={styles.navItemWrapper}>
      <Link href={link}><a className={styles.navItem}>
        {text}
      </a></Link>
      {children ?
        <div className={styles.subNav}>{children}</div>
        : null}
    </div>
  )
}

NavItem.defaultProps = {
  children: null
}

export default NavItem
