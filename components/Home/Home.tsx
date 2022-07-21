import Link from 'next/link';
import apiSWR from 'utils/apiSWR'

import Slider from './Slider/Slider'
import Heart from 'components/Heart/Heart'
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
              <h2>HDRIs</h2>
              <p>16k+ resolution, and always unclipped for one-click realistic lighting.</p>
              <Button text="Browse HDRIs" href="/hdris" color='blue' />
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
              <h2>Textures</h2>
              <p>Photoscanned seamless PBR materials, at least 8k resolution.</p>
              <Button text="Browse Textures" href="/textures" color='orange' />
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
              <h2>Models</h2>
              <p>Hyperreal 3D models, for visual effects and next-gen video games.</p>
              <Button text="Browse Models" href="/models" color='green' />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.sectionWrapper} ${styles.windowBannerRend}`}>
        <div className={styles.gradientLeft} />
        <div className={styles.section}>
          <div className={styles.subSection}>
            <div className={styles.text}>
              <h2>100% Free</h2>
              <p>Not just free, but <Link href="/license">CC0</Link>, meaning you can use them for absolutely any purpose <strong>without restrictions</strong>.</p>
              <p>No paywalls or signup required, simply download what you want and use it immediately without worry.</p>
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
              <h2>High Quality</h2>
              <p>"Free" and "quality" don't always have to be mutually exclusive.</p>
              <p>We don't want to pollute the web with more trash, so we focus on creating the best <strong>assets that you can actually use</strong>.</p>
              <p>Our target is to create content that will not just hold up to today's standards, but higher future standards, and the potential of future hardware too.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionWrapper}>
        <div className={`${styles.section} ${styles.sectionHalfMobile}`}>
          <div className={styles.subSection}>
            <h2>Supported by you <Heart color="#F96854" /></h2>
            <GoalProgress mode="big" />
            <Button text="Become a Patron" href="https://www.patreon.com/polyhaven/overview" />
            <Button text="Finance Reports" href="/finance-reports" color='hollow' />
          </div>
          <div className={styles.subSection}>
            <div className={styles.textLeft}>
              <p>As a 3D artist yourself, you know how much work it is to create good assets, especially when other people will need to use them for a variety of projects.</p>
              <p>The computers and camera equipment necessary to produce high quality content are expensive, and so is the web infrastructure needed to keep this platform running.</p>
              <p>This is where you come in.</p>
              <p>With your support, not only can we keep Poly Haven alive and running, but <strong>we can improve it</strong>.</p>
            </div>
          </div>
        </div>
        <div className={styles.newestPatrons}>
          <h4>Newest Patrons:</h4>
          <LatestPatrons />
          <div className={styles.fade} />
        </div>
        <CorporateSponsors home />
      </div>

      <div className={`${styles.sectionWrapper} ${styles.sectionBrowse}`}>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseAll}`}>
          <Button text="Browse All Assets" href="/all" />
        </div>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseHDRIs}`}>
          <Button text="Browse HDRIs" href="/hdris" color='blue' />
        </div>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseTextures}`}>
          <Button text="Browse Textures" href="/textures" color='orange' />
        </div>
        <div className={`${styles.btnBrowse} ${styles.btnBrowseModels}`}>
          <Button text="Browse Models" href="/models" color='green' />
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
              <h2 style={{ textAlign: 'center' }}>About Us</h2>
              <p>Poly Haven is a small company based in South Africa, working with artists around the world.</p>
              <p>Our goal is to create a constantly growing community-funded resource of open content, for complete freedom and usability by professionals and hobbyists alike. </p>
              <p>Previously we ran <span className='text-blue'>HDRI Haven</span>, <span className='text-orange'>Texture Haven</span> and <span className='text-green'>3D Model Haven</span> as separate independent projects, but ultimately decided we could serve the community better by joining forces and creating a single new platform: <span className='text-accent'>Poly Haven</span>.</p>
              <p>If you like what we do and want to keep this site alive, consider <a href="https://www.patreon.com/polyhaven/overview">supporting us on Patreon</a>.</p>
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.hideMobileStaff}`}>
            <div className={styles.staff}>
              <div className={styles.avatarRow}>
                <Staff id="Greg Zaal" name="Greg Zaal" role="Director, HDRIs" country="ZA" mode="compact" />
                <Staff id="Rob Tuytel" name="Rob Tuytel" role="Co-founder, Textures" country="NL" mode="compact" />
                <Staff id="Rico Cilliers" name="Rico Cilliers" role="Models, Textures" country="ZA" mode="compact" />
                <Staff id="James Ray Cock" name="James Ray Cock" role="Models" country="ZA" mode="compact" />
                <Staff id="Dario Barresi" name="Dario Barresi" role="Textures" country="ZA" mode="compact" />
              </div>
              <div className={styles.avatarRow}>
                <Staff id="Andreas Mischok" name="Andreas Mischok" role="HDRIs" country="DE" mode="compact" />
                <Staff id="Sergej Majboroda" name="Sergej Majboroda" role="HDRIs" country="UA" mode="compact" />
                <Staff id="Dimitrios Savva" name="Dimitrios Savva" role="Textures, HDRIs" country="ZA" mode="compact" />
                <Staff id="Jurita Burger" name="Jurita Burger" role="Graphic Design" country="ZA" mode="compact" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.sectionWrapper} style={{ position: 'relative' }}>
        <h1 style={{ paddingTop: '1rem' }}>Community Renders:</h1>
        <div className={styles.gallery}>
          {galleryData ? <Gallery data={galleryData} assetPage={true} /> : <Loader />}
        </div>
        <div className={styles.moreGallery}>
          <div className={styles.spacer} />
          <div><Button text="More" href="/gallery" /></div>
        </div>
      </div>

      <div className={styles.sectionWrapper}>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h2>Join the Community</h2>
            <p>Poly Haven is <strong>your</strong> community project.</p>
            <p>Everything we do, we do with your help, for the greater 3D community.</p>
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
