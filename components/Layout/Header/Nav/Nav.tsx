import { useState } from 'react'

import { MdMenu } from 'react-icons/md'

import NavItem from './NavItem'

import styles from './Nav.module.scss'

const Nav = () => {
  const [navHide, setToggle] = useState(true);

  const toggle = () => {
    setToggle(!navHide)
  }

  return (
    <>
      <div className={`${styles.nav} ${navHide ? styles.hiddenMobile : null}`}>
        <NavItem text="Assets" link="/all">
          <NavItem text="HDRIs" link="/hdris" />
          <NavItem text="Textures" link="/textures" />
          <NavItem text="Models" link="/models" />
        </NavItem>
        <NavItem text="News" link="https://www.patreon.com/polyhaven/posts?public=true" />
        <NavItem text="Support Us" link="https://www.patreon.com/polyhaven/overview" />
        <NavItem text="About/Contact" link="/about-contact" />
      </div>
      <div className={styles.menuToggle} onClick={toggle}><MdMenu /></div>
    </>
  )
}

export default Nav
