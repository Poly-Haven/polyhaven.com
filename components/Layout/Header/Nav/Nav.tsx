import NavItem from './NavItem'

import styles from './Nav.module.scss'

const Nav = () => {
  return (
    <div className={styles.nav}>
      <NavItem text="Assets" link="/all">
        <NavItem text="HDRIs" link="/hdris" />
        <NavItem text="Textures" link="/textures" />
        <NavItem text="Models" link="/models" />
      </NavItem>
      <NavItem text="News" link="https://www.patreon.com/polyhaven/posts?public=true" />
      <NavItem text="Support Us" link="https://www.patreon.com/polyhaven/overview" />
      <NavItem text="About/Contact" link="/about-contact" />
    </div>
  )
}

export default Nav
