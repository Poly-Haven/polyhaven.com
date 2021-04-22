import Link from 'next/link';

import styles from './Nav.module.scss'

const NavItem = ({ text, link, children }) => {
  return (
    <Link href={link}><a className={styles.navItem}>
      {text}
      {children ?
        <div className={styles.subNav}>{children}</div>
        : null}
    </a></Link>
  )
}

NavItem.defaultProps = {
  children: null
}

export default NavItem
