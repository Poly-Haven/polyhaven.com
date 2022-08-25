import { useTranslation, Trans } from 'next-i18next';
import Link from 'next/link';
import LinkText from 'components/LinkText/LinkText';
import apiSWR from 'utils/apiSWR'

import Slider from './Slider/Slider'
import Heart from 'components/UI/Icons/Heart'
import Button from 'components/Button/Button'
import LatestPatrons from './LatestPatrons'
import GoalProgress from 'components/ProgressBar/GoalProgress'
import SocialIcons from 'components/SocialIcons/SocialIcons'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'
import Staff from 'components/Avatar/Staff'
import Gallery from 'components/Gallery/Gallery';
import Loader from 'components/UI/Loader/Loader';

import styles from './Home.module.scss'

const Home = () => {
  const { t: tc } = useTranslation('common');
  const { t } = useTranslation('home');
  const { data: galleryData, error } = apiSWR(`/gallery?limit=22`, { revalidateOnFocus: false });

  return (
    <div className={styles.home}>

      <Slider />

      <div className={styles.sectionWrapper}>
        <div className={styles.assetTypeBanner}>
          <div className={`${styles.subSection} ${styles.subSectionHDRI}`}>
            <Link href="/hdris"><a>
              <div className={styles.assetTypeImage}>
                <img src="https://cdn.polyhaven.com/site_images/home/balls/hdri.png?width=300" />
                <img src="https://cdn.polyhaven.com/site_images/home/balls/hdri_h.png?width=300" className={styles.hover} />
              </div>
            </a></Link>
            <div className={styles.text}>
              <h2>{tc('HDRIs')}</h2>
              <p>{t('types-hdri')}</p>
              <Button text={t('types-hdri-b')} href="/hdris" color='blue' />
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.subSectionTex}`}>
            <Link href="/textures"><a>
              <div className={styles.assetTypeImage}>
                <img src="https://cdn.polyhaven.com/site_images/home/balls/tex.png?width=300" />
                <img src="https://cdn.polyhaven.com/site_images/home/balls/tex_h.png?width=300" className={styles.hover} />
              </div>
            </a></Link>
            <div className={styles.text}>
              <h2>{tc('Textures')}</h2>
              <p>{t('types-tex')}</p>
              <Button text={t('types-tex-b')} href="/textures" color='orange' />
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.subSectionMod}`}>
            <Link href="/models"><a>
              <div className={styles.assetTypeImage}>
                <img src="https://cdn.polyhaven.com/site_images/home/balls/mod.png?width=300" />
                <img src="https://cdn.polyhaven.com/site_images/home/balls/mod_h.png?width=300" className={styles.hover} />
              </div>
            </a></Link>
            <div className={styles.text}>
              <h2>{tc('Models')}</h2>
              <p>{t('types-mod')}</p>
              <Button text={t('types-mod-b')} href="/models" color='green' />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.sectionWrapper} ${styles.windowBannerRend}`}>
        <div className={styles.gradientLeft} />
        <div className={styles.section}>
          <div className={styles.subSection}>
            <div className={styles.text}>
              <h2>{t('s1t')}</h2>
              <p><Trans
                i18nKey="s1p1"
                t={t}
                components={{
                  lnk: <LinkText href="/license" />,
                  strong: <strong />
                }}
              /></p>
              <p>{t('s1p2')}</p>
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.hideMobileHalf}`} />
        </div>
      </div>
      <div className={`${styles.sectionWrapper} ${styles.windowBannerClay}`}>
        <div className={styles.gradientRight} />
        <div className={styles.section}>
          <div className={`${styles.subSection} ${styles.hideMobileHalf}`} />
          <div className={styles.subSection}>
            <div className={styles.text}>
              <h2>{t('s2t')}</h2>
              <p>{t('s2p1')}</p>
              <p><Trans
                i18nKey="s2p2"
                t={t}
                components={{
                  strong: <strong />
                }}
              /></p>
              <p>{t('s2p3')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionWrapper}>
        <div className={`${styles.section} ${styles.sectionHalfMobile}`}>
          <div className={styles.subSection}>
            <h2>{t('s3t')} <Heart color="#F96854" /></h2>
            <GoalProgress mode="big" />
            <Button text={t('s3b1')} href="https://www.patreon.com/polyhaven/overview" />
            <Button text={tc('nav.finances')} href="/finance-reports" color='hollow' />
          </div>
          <div className={styles.subSection}>
            <div className={styles.textLeft}>
              <p>{t('s3p1')}</p>
              <p>{t('s3p2')}</p>
              <p>{t('s3p3')}</p>
              <p><Trans
                i18nKey="s3p4"
                t={t}
                components={{
                  strong: <strong />
                }}
              /></p>
            </div>
          </div>
        </div>
        <div className={styles.newestPatrons}>
          <h4>{t('s4')}</h4>
          <LatestPatrons />
          <div className={styles.fade} />
        </div>
        <CorporateSponsors home header={tc('also-supported-by')} />
      </div>

      <div className={`${styles.sectionWrapper} ${styles.sectionBrowse}`}>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseAll}`}>
          <Button text={t('s5b1')} href="/all" />
        </div>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseHDRIs}`}>
          <Button text={t('s5b2')} href="/hdris" color='blue' />
        </div>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseTextures}`}>
          <Button text={t('s5b3')} href="/textures" color='orange' />
        </div>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseModels}`}>
          <Button text={t('s5b4')} href="/models" color='green' />
        </div>
        <div className={styles.hoverBrowseAll} />
        <div className={styles.hoverBrowseHDRIs} />
        <div className={styles.hoverBrowseTextures} />
        <div className={styles.hoverBrowseModels} />
      </div>

      <div className={styles.sectionWrapper}>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <div className={styles.text}>
              <h2 style={{ textAlign: 'center' }}>{t('s6t')}</h2>
              <p>{t('s6p1')}</p>
              <p>{t('s6p2')}</p>
              <p><Trans
                i18nKey="s6p3"
                t={t}
                components={{
                  c1: <span className='text-blue' />,
                  c2: <span className='text-orange' />,
                  c3: <span className='text-green' />,
                  c4: <span className='text-accent' />,
                }}
              /></p>
              <p><Trans
                i18nKey="s6p4"
                t={t}
                components={{
                  lnk: <a href="https://www.patreon.com/polyhaven/overview" />
                }}
              /></p>
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.hideMobileStaff}`}>
            <div className={styles.staff}>
              <div className={styles.avatarRow}>
                <Staff id="Greg Zaal" name="Greg Zaal" role={`${tc('common:Director')}, ${tc('common:HDRIs')}`} country="ZA" mode="compact" />
                <Staff id="Rob Tuytel" name="Rob Tuytel" role={`${tc('common:Co-founder')}, ${tc('common:Textures')}`} country="NL" mode="compact" />
                <Staff id="Rico Cilliers" name="Rico Cilliers" role={`${tc('common:Models')}, ${tc('common:Textures')}`} country="ZA" mode="compact" />
                <Staff id="James Ray Cock" name="James Ray Cock" role={`${tc('common:Models')}`} country="ZA" mode="compact" />
                <Staff id="Dario Barresi" name="Dario Barresi" role={`${tc('common:Textures')}`} country="ZA" mode="compact" />
              </div>
              <div className={styles.avatarRow}>
                <Staff id="Andreas Mischok" name="Andreas Mischok" role={`${tc('common:HDRIs')}`} country="DE" mode="compact" />
                <Staff id="Sergej Majboroda" name="Sergej Majboroda" role={`${tc('common:HDRIs')}`} country="UA" mode="compact" />
                <Staff id="Dimitrios Savva" name="Dimitrios Savva" role={`${tc('common:Textures')}, ${tc('common:HDRIs')}`} country="ZA" mode="compact" />
                <Staff id="Jurita Burger" name="Jurita Burger" role={`${tc('common:Graphic-Design')}`} country="ZA" mode="compact" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionWrapper} style={{ position: 'relative' }}>
        <h1 style={{ paddingTop: '1rem' }}>{t('s7')}</h1>
        <div className={styles.gallery}>
          {galleryData ? <Gallery data={galleryData} assetPage={true} /> : <Loader />}
        </div>
        <div className={styles.moreGallery}>
          <div className={styles.spacer} />
          <div><Button text={t('s7b')} href="/gallery" /></div>
        </div>
      </div>

      <div className={styles.sectionWrapper}>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h2>{t('s8t')}</h2>
            <p><Trans
              i18nKey="s8p1"
              t={t}
              components={{
                strong: <strong />
              }}
            /></p>
            <p>{t('s8p2')}</p>
          </div>
          <div className={styles.subSection}>
            <SocialIcons />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
