import { useState } from 'react'
import { useUser } from '@auth0/nextjs-auth0';

import { MdMenu, MdExpandLess, MdAccountCircle } from 'react-icons/md'

import NavItem from './NavItem'

import styles from './Nav.module.scss'

const Nav = () => {
  const { user, isLoading } = useUser();
  const [navHide, setToggle] = useState(true);

  const toggle = () => {
    setToggle(!navHide)
  }

  return (
    <>
      <div className={`${styles.nav} ${navHide ? styles.hiddenMobile : null}`} onClick={() => { setToggle(true) }}>
        <NavItem text="Assets" link="/all">
          <NavItem text="HDRIs" link="/hdris" />
          <NavItem text="Textures" link="/textures" />
          <NavItem text="Models" link="/models" />
        </NavItem>
        <NavItem text="News" link="https://www.patreon.com/polyhaven/posts?public=true" />
        <NavItem text="Support Us" link="https://www.patreon.com/polyhaven/overview" />
        <NavItem text="About/Contact" link="/about-contact" />
        {!isLoading && user &&
          <NavItem text={<MdAccountCircle />} link="/account">
            <NavItem text="Logout" link="/api/auth/logout" />
          </NavItem>
        }
      </div>
      <div className={styles.menuToggle} onClick={toggle}>{navHide ? <MdMenu /> : <MdExpandLess />}</div>
    </>
  )
}

export default Nav
