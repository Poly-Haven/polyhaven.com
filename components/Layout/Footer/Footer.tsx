import { useTranslation, Trans } from 'next-i18next'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'
import SocialIcons from 'components/UI/Icons/SocialIcons/SocialIcons'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'
import PatronList from './PatronList'

import styles from './Footer.module.scss'

const footer = () => {
  const { t } = useTranslation(['common'])
  const router = useRouter()

  return (
    <div id={styles.footer} dir={['ar', 'fa'].includes(router.locale) ? 'rtl' : 'ltr'}>
      <h2>
        <Trans
          i18nKey="common:footer.thanks"
          t={t}
          components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
        />{' '}
        <Heart color="#F96854" />
      </h2>
      <div className={styles.patrons}>
        <div className={styles.patronsScrollWrapper}>
          <div className={styles.patronsScroll}>
            <div className={styles.patronsSetA}>
              <PatronList />
            </div>
          </div>
        </div>
      </div>
      <CorporateSponsors header={t('also-supported-by')} />
      <div className={styles.buttonWrapper}>
        <Button text={t('footer.join-ranks')} href="https://www.patreon.com/polyhaven/overview" />
      </div>
      <div className={styles.linksWrapper}>
        <a id="social" />
        <div className={styles.links}>
          <Link href="/">

            <div className={styles.logoWrapper}>
              <img src="/Logo 256.png" className={styles.logo} />
              <h1>Poly Haven</h1>
              <p>{t('common:tagline')}</p>
            </div>

          </Link>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link prefetch={false} href="/">
                {t('common:nav.home')}
              </Link>
              <Link prefetch={false} href="/faq">
                {t('common:nav.faq')}
              </Link>
              <Link prefetch={false} href="/about-contact">
                {t('common:nav.about-contact')}
              </Link>
              <Link prefetch={false} href="/gallery">
                {t('common:nav.gallery')}
              </Link>
              <Link prefetch={false} href="/map">
                {t('common:nav.map')}
              </Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link prefetch={false} href="/license">
                {t('common:nav.license')}
              </Link>
              <Link prefetch={false} href="/privacy">
                {t('common:nav.privacy')}
              </Link>
              <Link prefetch={false} href="/finance-reports">
                {t('common:nav.finances')}
              </Link>
              <Link prefetch={false} href="/stats">
                {t('common:nav.stats')}
              </Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link prefetch={false} href="https://blog.polyhaven.com">
                {t('common:nav.blog')}
              </Link>
              <Link prefetch={false} href="https://docs.polyhaven.com">
                Wiki
              </Link>
              <Link prefetch={false} href="/contribute">
                {t('common:nav.contribute')}
              </Link>
              <Link prefetch={false} href="https://github.com/Poly-Haven/Public-API">
                {t('common:nav.api')}
              </Link>
              <Link prefetch={false} href="https://github.com/Poly-Haven/polyhaven.com">
                {t('common:nav.source')}
              </Link>
            </div>
          </div>
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}

export default footer
