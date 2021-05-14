import NavItem from './NavItem'

import styles from './Nav.module.scss'

const Nav = () => {
  return (
    <div className={styles.nav}>
      <NavItem text="Assets" link="/">
        <NavItem text="HDRIs" link="/hdris" />
        <NavItem text="Textures" link="/textures" />
        <NavItem text="Models" link="/models" />
      </NavItem>
      <NavItem text="News" link="https://www.patreon.com/hdrihaven/posts?public=true" />
      <NavItem text="Support Us" link="https://polyhaven.com/support-us" />
      <NavItem text="About/Contact" link="/about-contact" />
    </div>
  )
}

export default Nav
