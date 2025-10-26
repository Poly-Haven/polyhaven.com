import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import locales from 'utils/locales'

import { MdMenu, MdExpandLess, MdAccountCircle, MdClose, MdFolder } from 'react-icons/md'
import { IoMdLogIn } from 'react-icons/io'

import useStoredState from 'hooks/useStoredState'

import NavItem from './NavItem'
import LocaleFlag from 'components/Layout/Header/Nav/LocaleFlag'
import Heart from 'components/UI/Icons/Heart'
import HeartLock from 'components/UI/Icons/HeartLock'
import Blender from 'components/UI/Icons/Blender'
import Unreal from 'components/UI/Icons/Unreal'

import styles from './Nav.module.scss'

const Nav = () => {
  const { t } = useTranslation(['common'])
  const router = useRouter()
  const { user } = useUser()
  const [suggestedLocale, setSuggestedLocale] = useState()
  const [suggestLocale, setSuggestLocale] = useStoredState('suggestLocale', true)
  const [navHide, setToggle] = useState(true)
  const [renderLocaleFlags, setRenderLocaleFlags] = useState(false)

  useEffect(() => {
    const fetchHeaders = async () => {
      await fetch(`/api/reqHeaders`, { method: 'POST' })
        .then((res) => res.json())
        .then((resdata) => {
          const reqLocales = resdata['accept-language'].split(',').map((l) => l.split(';')[0])
          for (const locale of reqLocales) {
            if (locales[locale]) {
              // This is the first requested locale that we support
              if (router.locale !== locale) {
                console.log(`Suggesting locale "${locale}" based on request headers`)
                setSuggestedLocale(locale)
              }
              break
            }
          }
        })
    }
    if (suggestLocale) {
      fetchHeaders()
    }
  }, [])

  const toggle = () => {
    setToggle(!navHide)
  }

  return (
    <>
      <div
        className={`${styles.nav} ${navHide ? styles.hiddenMobile : null}`}
        onClick={() => {
          setToggle(true)
        }}
      >
        <NavItem text={t('common:Assets')} link="/all">
          <NavItem
            text={
              <span className={styles.assetType}>
                <img src="/icons/a_hdris.png" /> {t('common:HDRIs')}
              </span>
            }
            link="/hdris"
          />
          <NavItem
            text={
              <span className={styles.assetType}>
                <img src="/icons/a_textures.png" /> {t('common:Textures')}
              </span>
            }
            link="/textures"
          />
          <NavItem
            text={
              <span className={styles.assetType}>
                <img src="/icons/a_models.png" /> {t('common:Models')}
              </span>
            }
            link="/models"
          />
          <hr />
          <NavItem
            text={
              <span className={styles.assetType}>
                <MdFolder />
                {t('common:nav.collections')}
              </span>
            }
            link="/collections"
          />
          <NavItem
            text={
              <span className={styles.assetType}>
                <HeartLock />
                Vaults
              </span>
            }
            link="/vaults"
          />
        </NavItem>
        <NavItem text={t('common:nav.plugins')} link="/plugins">
          <NavItem
            text={
              <>
                <Blender /> Blender {t('common:nav.add-on')}
              </>
            }
            link="/plugins/blender"
          />
          <NavItem
            text={
              <>
                <Unreal /> UE HDRI Browser
              </>
            }
            link="/plugins/unreal"
          />
        </NavItem>
        <NavItem
          text={
            <span className={styles.assetType}>
              <HeartLock />
              Vaults
            </span>
          }
          link="/vaults"
        />
        <NavItem text={t('common:nav.gallery')} link="/gallery" />
        <NavItem
          text={
            <>
              <Heart color="#F96854" /> {t('common:nav.support-us')}
            </>
          }
          link="https://www.patreon.com/polyhaven/overview"
        />
        <NavItem text={t('common:nav.about-contact')} link="/about-contact">
          <NavItem text={t('common:nav.faq')} link={`https://docs.polyhaven.com/${router.locale}/faq`} />
          <NavItem text={t('common:nav.license')} link="/license" />
          <NavItem text={t('common:nav.news')} link="https://www.patreon.com/polyhaven/posts?public=true" />
          <NavItem text={t('common:nav.blog')} link="https://blog.polyhaven.com" />
        </NavItem>

        {user ? (
          <NavItem text={<MdAccountCircle />} link="/account">
            <NavItem text={t('common:nav.logout')} link="/api/auth/logout" />
          </NavItem>
        ) : (
          <NavItem text={<IoMdLogIn />} link={`/account?returnTo=${router.asPath}`} />
        )}
      </div>

      <div style={{ height: '100%', display: 'flex' }}>
        {suggestedLocale && suggestLocale ? (
          <div className={styles.suggestedLocale}>
            <NavItem
              text={
                <LocaleFlag
                  locale={suggestedLocale}
                  flag={locales[suggestedLocale]['flag']}
                  name={locales[suggestedLocale]['name']}
                />
              }
              link={router.asPath}
              locale={suggestedLocale}
            />
            <MdClose title="Don't suggest a locale again" onClick={() => setSuggestLocale(false)} />
          </div>
        ) : null}
        <NavItem
          compact={true}
          text={<LocaleFlag locale={router.locale} flag={locales[router.locale].flag} />}
          onMouseEnter={() => setRenderLocaleFlags(true)}
        >
          {Object.keys(locales).map(
            (l) =>
              renderLocaleFlags && (
                <NavItem
                  key={l}
                  text={<LocaleFlag locale={l} flag={locales[l].flag} name={locales[l].name} />}
                  link={router.asPath}
                  locale={l}
                />
              )
          )}
          <hr />
          <NavItem text="🤝 Help Translate!" link="/translate" />
        </NavItem>
      </div>

      <div className={styles.menuToggle} onClick={toggle}>
        {navHide ? <MdMenu /> : <MdExpandLess />}
      </div>
    </>
  )
}

export default Nav
