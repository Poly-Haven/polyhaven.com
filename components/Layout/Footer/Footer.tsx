import { useTranslation, Trans } from 'next-i18next';
import Link from 'next/link';

import Button from 'components/Button/Button'
import Heart from 'components/Heart/Heart'
import SocialIcons from 'components/SocialIcons/SocialIcons'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'
import PatronList from './PatronList'

import styles from './Footer.module.scss';

const footer = () => {
  const { t } = useTranslation(['common']);

  return (
    <div id={styles.footer}>
      <h2><Trans
        i18nKey="common:footer.thanks"
        t={t}
        components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
      /> <Heart color="#F96854" /></h2>
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
          <Link href="/"><a>
            <div className={styles.logoWrapper}>
              <img src='/Logo 256.png' className={styles.logo} />
              <h1>Poly Haven</h1>
              <p>{t('common:tagline')}</p>
            </div>
          </a></Link>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link prefetch={false} href="/"><a>{t('common:nav.home')}</a></Link>
              <Link prefetch={false} href="/faq"><a>{t('common:nav.faq')}</a></Link>
              <Link prefetch={false} href="/about-contact"><a>{t('common:nav.about-contact')}</a></Link>
              <Link prefetch={false} href="/gallery"><a>{t('common:nav.gallery')}</a></Link>
              <Link prefetch={false} href="/map"><a>{t('common:nav.map')}</a></Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link prefetch={false} href="/license"><a>{t('common:nav.license')}</a></Link>
              <Link prefetch={false} href="/privacy"><a>{t('common:nav.privacy')}</a></Link>
              <Link prefetch={false} href="/finance-reports"><a>{t('common:nav.finances')}</a></Link>
              <Link prefetch={false} href="/stats"><a>{t('common:nav.stats')}</a></Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link prefetch={false} href="https://blog.polyhaven.com"><a>{t('common:nav.blog')}</a></Link>
              <Link prefetch={false} href="/contribute"><a>{t('common:nav.contribute')}</a></Link>
              <Link prefetch={false} href="https://github.com/Poly-Haven/Public-API"><a>{t('common:nav.api')}</a></Link>
              <Link prefetch={false} href="https://github.com/Poly-Haven/polyhaven.com"><a>{t('common:nav.source')}</a></Link>
            </div>
          </div>
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}

export default footer;