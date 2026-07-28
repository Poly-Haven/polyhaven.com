import { useTranslation } from 'next-i18next'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '@auth0/nextjs-auth0/client'
import locales from 'utils/locales'

import { MdMenu, MdExpandLess, MdAccountCircle, MdClose, MdFolder, MdList } from 'react-icons/md'
import { IoMdLogIn } from 'react-icons/io'
import { PiStudentFill } from 'react-icons/pi'

import useStoredState from 'hooks/useStoredState'

import NavItem from './NavItem'
import LocaleFlag from 'components/Layout/Header/Nav/LocaleFlag'
import Heart from 'components/UI/Icons/Heart'
import HeartLock from 'components/UI/Icons/HeartLock'
import Blender from 'components/UI/Icons/Blender'
import Lighthouse from 'components/UI/Icons/Lighthouse'

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
      const cachedHeaderKey = 'acceptLanguage'
      let acceptLanguage = null

      try {
        acceptLanguage = localStorage.getItem(cachedHeaderKey)
      } catch (error) {
        console.warn('Unable to read cached accept-language header', error)
      }

      if (!acceptLanguage) {
        try {
          const response = await fetch('/api/reqHeaders', { method: 'POST' })
          const resdata = await response.json()
          acceptLanguage = resdata?.['accept-language']
          if (acceptLanguage) {
            try {
              localStorage.setItem(cachedHeaderKey, acceptLanguage)
            } catch (error) {
              console.warn('Unable to cache accept-language header', error)
            }
          }
        } catch (error) {
          console.warn('Unable to fetch request headers', error)
        }
      }

      if (!acceptLanguage) {
        return
      }

      const reqLocales = acceptLanguage.split(',').map((l) => l.split(';')[0])
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
    }
    if (suggestLocale) {
      fetchHeaders()
    }
  }, [])

  const toggle = () => {
    setToggle(!navHide)
  }

  // Close the mobile drawer whenever we navigate away.
  useEffect(() => {
    const close = () => setToggle(true)
    router.events.on('routeChangeComplete', close)
    return () => router.events.off('routeChangeComplete', close)
  }, [router.events])

  // While the drawer is open, close on Escape and stop the page behind it from scrolling.
  useEffect(() => {
    if (navHide) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setToggle(true)
    }
    // #page is the app's scroll container; body covers pages that scroll the document instead.
    const scrollTargets = [document.body, document.getElementById('page')].filter(Boolean)
    const prevOverflow = scrollTargets.map((el) => el.style.overflow)
    scrollTargets.forEach((el) => (el.style.overflow = 'hidden'))

    // The header owns the stacking context the drawer lives in, so the drawer
    // can't out-stack the cookie banner (999) on its own. Raise it for as long
    // as the drawer is open, rather than globally - at rest the header must stay
    // below the lightbox.
    const header = document.getElementById('mainheader')
    const prevZIndex = header?.style.zIndex
    if (header) header.style.zIndex = '1001'

    window.addEventListener('keydown', onKeyDown)

    return () => {
      scrollTargets.forEach((el, i) => (el.style.overflow = prevOverflow[i]))
      if (header) header.style.zIndex = prevZIndex
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [navHide])

  // Project lighthouse, remove after deadline
  const submissionDeadline = '2026-05-01T23:59:59.999Z'
  const currentTime = new Date().toISOString()
  const isBeforeDeadline = currentTime < submissionDeadline
  const showLighthouseNav =
    isBeforeDeadline && router.asPath !== '/project/lighthouse' && !router.asPath.startsWith('/a/')

  return (
    <>
      {!navHide ? <div className={styles.backdrop} onClick={() => setToggle(true)} /> : null}

      <div
        id="main-nav"
        className={`${styles.nav} ${navHide ? styles.hiddenMobile : null}`}
        onClick={() => {
          setToggle(true)
        }}
      >
        {showLighthouseNav && <NavItem text="Join Project Lighthouse" link="/project/lighthouse" lighthouse />}
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
        <NavItem
          text={
            <>
              <Blender /> {t('common:nav.add-on')}
            </>
          }
          link="/plugins/blender"
        >
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
                <MdList /> Other tools and plugins
              </>
            }
            link="/tools"
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
        <NavItem
          text={
            <span className={styles.assetType}>
              <PiStudentFill />
              Learn
            </span>
          }
          link="/learn"
        />
        <NavItem text={t('common:nav.gallery')} link="/gallery" />
        <NavItem
          text={
            <>
              <Heart color="#F96854" /> {t('common:nav.support-us')}
            </>
          }
          link="https://www.patreon.com/polyhaven/join?cadence=12"
        />
        <NavItem text={t('common:nav.about-contact')} link="/about-contact">
          <NavItem text={t('common:nav.faq')} link={`https://docs.polyhaven.com/${router.locale}/faq`} />
          <NavItem text={t('common:nav.license')} link="/license" />
          <NavItem text={t('common:nav.news')} link="https://www.patreon.com/polyhaven/posts?public=true" />
          <NavItem text={t('common:nav.blog')} link="https://blog.polyhaven.com" />
          <NavItem
            text={
              <span className={styles.assetType}>
                <Lighthouse color="rgb(0, 222, 151)" /> Project Lighthouse
              </span>
            }
            link="/project/lighthouse"
          />
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

      <button
        type="button"
        className={styles.menuToggle}
        onClick={toggle}
        aria-expanded={!navHide}
        aria-controls="main-nav"
        aria-label={t('common:nav.menu', 'Menu')}
      >
        {navHide ? <MdMenu /> : <MdExpandLess />}
      </button>
    </>
  )
}

export default Nav
