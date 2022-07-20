import { useTranslation, Trans } from 'next-i18next';

import { LinkText } from 'components/LinkText/LinkText';
import Staff from 'components/Avatar/Staff'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'

import styles from './AboutContact.module.scss'

const AboutPage = () => {
  const { t } = useTranslation(['common', 'about']);

  return (
    <div>
      <div className={styles.intro}>
        <img src='/Logo 256.png' className={styles.logo} />
        <div className={styles.text}>
          <h1>{t('about:greeting.h1')}</h1>
          <p>{t('about:greeting.p1')}</p>
          <p>{t('about:greeting.p2')}</p>
          <p><Trans
            i18nKey="about:greeting.p3"
            t={t}
            components={{ lnk: <LinkText href="/license" /> }}
          /></p>
          <p></p>
        </div>
      </div>

      <div className={styles.staff}>
        <Staff id="Greg Zaal" name="Greg Zaal" role={`${t('common:Director')}, HDRIs`} country="ZA" mode="full" />
        <Staff id="Rob Tuytel" name="Rob Tuytel" role={`${t('common:Co-founder')}, ${t('common:Textures')}`} country="NL" mode="full" />
        <Staff id="Rico Cilliers" name="Rico Cilliers" role={`${t('common:Models')}, ${t('common:Textures')}`} country="ZA" mode="full" />
        <Staff id="James Ray Cock" name="James Ray Cock" role={`${t('common:Models')}`} country="ZA" mode="full" />
        <Staff id="Dario Barresi" name="Dario Barresi" role={`${t('common:Textures')}`} country="ZA" mode="full" />
        <Staff id="Andreas Mischok" name="Andreas Mischok" role={`${t('common:HDRIs')}`} country="DE" mode="full" />
        <Staff id="Sergej Majboroda" name="Sergej Majboroda" role={`${t('common:HDRIs')}`} country="UL" mode="full" />
        <Staff id="Dimitrios Savva" name="Dimitrios Savva" role={`${t('common:Textures')}, ${t('common:HDRIs')}`} country="ZA" mode="full" />
        <Staff id="Jurita Burger" name="Jurita Burger" role={`${t('common:Graphic-Design')}`} country="ZA" mode="full" />
      </div>

      <CorporateSponsors header={`${t('common:corporate-sponsors')}:`} />

      <h1>{t('about:contact.h1')}</h1>
      <p><Trans
        i18nKey="about:contact.p1"
        t={t}
        components={{ lnk: <LinkText href="/faq" /> }}
      /></p>
      <p><Trans
        i18nKey="about:contact.p2"
        t={t}
        components={{
          lnk1: <a href="mailto:info@polyhaven.com" />,
          lnk2: <a href="https://discord.gg/Dms7Mrs" />
        }}
      /></p>

      <h1>{t('about:why.h1')}</h1>
      <p>{t('about:why.p1')}</p>
      <p>{t('about:why.p2')}</p>
      <p>{t('about:why.p3')}</p>

      <h1>{t('about:how.h1')}</h1>
      <p>{t('about:how.p1')}</p>
      <p><Trans
        i18nKey="about:how.p2"
        t={t}
        components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
      /></p>
      <p>{t('about:how.p3')}</p>
      <ol>
        <li>{t('about:how.li1')}</li>
        <li>{t('about:how.li2')}</li>
        <li>{t('about:how.li3')}</li>
      </ol>

      <h1>{t('about:transparency.h1')}</h1>
      <p>{t('about:transparency.p1')}</p>
      <p>{t('about:transparency.p2')}</p>
      <ul>
        <li><Trans
          i18nKey="about:transparency.li1"
          t={t}
          components={{ lnk: <a href="https://blog.polyhaven.com/" /> }}
        /></li>
        <li><Trans
          i18nKey="about:transparency.li2"
          t={t}
          components={{ lnk: <a href="https://www.patreon.com/polyhaven/posts?public=true" /> }}
        /></li>
        <li><Trans
          i18nKey="about:transparency.li3"
          t={t}
          components={{ lnk: <a href="https://discord.gg/Dms7Mrs" /> }}
        /></li>
        <li><Trans
          i18nKey="about:transparency.li4"
          t={t}
          components={{ lnk: <a href="#social" /> }}
        /></li>
        <li><Trans
          i18nKey="about:transparency.li5"
          t={t}
          components={{ lnk: <LinkText href="/finance-reports" /> }}
        /></li>
      </ul>

      <h1>{t('about:help.h1')}</h1>

      <h2>1. {t('about:help.s1')}</h2>
      <p><Trans
        i18nKey="about:help.s1p1"
        t={t}
        components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
      /></p>
      <p>{t('about:help.s1p2')}</p>
      <p><Trans
        i18nKey="about:help.s1p3"
        t={t}
        components={{ lnk: <LinkText href="/finance-reports" /> }}
      /></p>

      <h2>2. {t('about:help.s2')}</h2>
      <p>{t('about:help.s2p1')}</p>
      <p><Trans
        i18nKey="about:help.s2p2"
        t={t}
        components={{
          lnk1: <LinkText href="/license" />,
          lnk2: <LinkText href="/contribute" />
        }}
      /></p>

      <h2>3. {t('about:help.s3')}</h2>
      <p>{t('about:help.s3p1')}</p>
      <p>{t('about:help.s3p2')}</p>

    </div>
  )
}

export default AboutPage