import { useTranslation } from 'next-i18next';
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0';
import locales from 'utils/locales'

import { MdMenu, MdExpandLess, MdAccountCircle } from 'react-icons/md'
import { IoMdLogIn } from 'react-icons/io';

import NavItem from './NavItem'
import LocaleFlag from 'components/Layout/Header/Nav/LocaleFlag';

import styles from './Nav.module.scss'

const Nav = () => {
  const { t } = useTranslation(['common']);
  const router = useRouter()
  const { user, isLoading } = useUser();
  const [navHide, setToggle] = useState(true);

  const toggle = () => {
    setToggle(!navHide)
  }

  return (
    <>
      <div className={`${styles.nav} ${navHide ? styles.hiddenMobile : null}`} onClick={() => { setToggle(true) }}>
        <NavItem text={t('common:Assets')} link="/all">
          <NavItem text={t('common:HDRIs')} link="/hdris" />
          <NavItem text={t('common:Textures')} link="/textures" />
          <NavItem text={t('common:Models')} link="/models" />
        </NavItem>
        <NavItem text={t('common:nav.gallery')} link="/gallery" />
        <NavItem text={t('common:nav.support-us')} link="https://www.patreon.com/polyhaven/overview" />
        <NavItem text={t('common:nav.about-contact')} link="/about-contact">
          <NavItem text={t('common:nav.license')} link="/license" />
          <NavItem text={t('common:nav.news')} link="https://www.patreon.com/polyhaven/posts?public=true" />
          <NavItem text={t('common:nav.blog')} link="https://blog.polyhaven.com" />
          <NavItem text={t('common:nav.faq')} link="/faq" />
        </NavItem>

        {user ?
          <NavItem text={<MdAccountCircle />} link="/account">
            <NavItem text={t('common:nav.logout')} link="/api/auth/logout" />
          </NavItem>
          :
          <NavItem text={<IoMdLogIn />} link={`/account?returnTo=${router.asPath}`} />
        }
      </div>

      <div style={{ height: '100%', display: 'flex' }}>
        <NavItem text={<LocaleFlag locale={router.locale} flag={locales[router.locale].flag} />}>
          {Object.keys(locales).map(l =>
            <NavItem key={l} text={<LocaleFlag locale={l} flag={locales[l].flag} name={locales[l].name} />} link={router.asPath} locale={l} />
          )}
          <hr />
          <NavItem text="🤝 Help Translate!" link="/translate" />
        </NavItem>
      </div>

      <div className={styles.menuToggle} onClick={toggle}>{navHide ? <MdMenu /> : <MdExpandLess />}</div>
    </>
  )
}

export default Nav
