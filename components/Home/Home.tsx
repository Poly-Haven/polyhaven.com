import Link from 'next/link';

import Slider from './Slider/Slider'
import Heart from 'components/Heart/Heart'
import Button from 'components/Button/Button'
import Patron from 'components/Avatar/Patron'
import ProgressBar from 'components/ProgressBar/ProgressBar'
import SocialIcons from 'components/SocialIcons/SocialIcons'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'
import Staff from 'components/Avatar/Staff'

import styles from './Home.module.scss'

const Home = ({ patreonGoal, patreonProgress }) => {
  const exampleNames = [
    "Joni Mercado",
    "S J Bennett",
    "Adam Nordgren",
    "RENDER WORX",
    "Pierre Beranger",
    "Pablo Lopez Soriano",
    "Frank Busch",
    "Sterling Roth",
    "Jonathan Sargent",
    "hector gil",
    "Philip bazel",
    "Llynara",
    "BlenderBrit",
    "william norberg",
    "Michael Szalapski",
    "Joni Mercado",
    "S J Bennett",
    "Adam Nordgren",
    "RENDER WORX",
    "Pierre Beranger",
    "Pablo Lopez Soriano",
    "Frank Busch",
    "Sterling Roth",
    "Jonathan Sargent",
    "hector gil",
    "Philip bazel",
    "Llynara",
    "BlenderBrit",
    "william norberg",
    "Michael Szalapski",
  ]

  let newestPatrons = {};
  for (const p of exampleNames) {
    newestPatrons[p] = {
      image: `https://picsum.photos/seed/${p}/36`,
      age: 1620830938000
    }
  }

  return (
    <div className={styles.home}>

      <Slider />

      <div className={styles.sectionWrapper}>
        <div className={styles.assetTypeBanner}>
          <div className={`${styles.subSection} ${styles.subSectionHDRI}`}>
            <div className={styles.assetTypeImage}>
              <img src="https://cdn.polyhaven.com/site_images/home/balls/hdri.png?width=300" />
              <img src="https://cdn.polyhaven.com/site_images/home/balls/hdri_h.png?width=300" className={styles.hover} />
            </div>
            <div className={styles.text}>
              <h2>HDRIs</h2>
              <p>16k+ resolution, and always unclipped for one-click realistic lighting.</p>
              <Button text="Browse HDRIs" href="/hdris" color='blue' />
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.subSectionTex}`}>
            <div className={styles.assetTypeImage}>
              <img src="https://cdn.polyhaven.com/site_images/home/balls/tex.png?width=300" />
              <img src="https://cdn.polyhaven.com/site_images/home/balls/tex_h.png?width=300" className={styles.hover} />
            </div>
            <div className={styles.text}>
              <h2>Textures</h2>
              <p>Photoscanned seamless PBR materials, at least 8k resolution.</p>
              <Button text="Browse Textures" href="/textures" color='orange' />
            </div>
          </div>
          <div className={`${styles.subSection} ${styles.subSectionMod}`}>
            <div className={styles.assetTypeImage}>
              <img src="https://cdn.polyhaven.com/site_images/home/balls/mod.png?width=300" />
              <img src="https://cdn.polyhaven.com/site_images/home/balls/mod_h.png?width=300" className={styles.hover} />
            </div>
            <div className={styles.text}>
              <h2>Models</h2>
              <p>Hyperreal 3D models, for visual effects and next-gen video games.</p>
              <Button text="Browse Models" href="/models" color='green' />
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.sectionWrapper} ${styles.windowBannerRend}`}>
        <div className={styles.gradientRight} />
        <div className={styles.section}>
          <div className={styles.subSection} />
          <div className={styles.subSection}>
            <div className={styles.text}>
              <h2>100% Free</h2>
              <p>Not just free, but <Link href="/license">CC0</Link>, meaning you can use them for absolutely any purpose <strong>without restrictions</strong>.</p>
              <p>No paywalls or signup required, simply download what you want and use it immediately without worry.</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`${styles.sectionWrapper} ${styles.windowBannerClay}`}>
        <div className={styles.gradientLeft} />
        <div className={styles.section}>
          <div className={styles.subSection}>
            <div className={styles.text}>
              <h2>High Quality</h2>
              <p>"Free" and "quality" don't always have to be mutually exclusive.</p>
              <p>We don't want to pollute the web with more trash, so we focus on creating the best <strong>assets that you can actually use</strong>.</p>
              <p>Our target is to create content that will not just hold up to today's standards, but higher future standards, and the potential of future hardware too.</p>
            </div>
          </div>
          <div className={styles.subSection} />
        </div>
      </div>

      <div className={styles.sectionWrapper}>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h2>Supported by you <Heart color="#F96854" /></h2>
            <ProgressBar progress={patreonProgress} label="Current goal" labelValue={patreonGoal} />
            <Button text="Become a Patron" href="https://www.patreon.com/hdrihaven/overview" />
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
          {Object.keys(newestPatrons).map(n => <Patron key={n + newestPatrons[n].age} name={n} image={newestPatrons[n].image} size={36} timestamp={newestPatrons[n].age} />)}
          <div className={styles.fade} />
        </div>
        <CorporateSponsors />
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
              <p>Previously we ran <span className='text-blue'>HDRI Haven</span>, <span className='text-orange'>Texture Haven</span> and <span className='text-green'>3D Model Haven</span> as separate independant projects, but ultimately decided we could serve the community better by joining forces and creating a single new platform: <span className='text-accent'>Poly Haven</span>.</p>
              <p>If you like what we do and want to keep this site alive, consider <a href="https://www.patreon.com/hdrihaven/overview">supporting us on Patreon</a>.</p>
            </div>
          </div>
          <div className={styles.subSection}>
            <div className={styles.staff}>
              <div className={styles.avatarRow}>
                <Staff id="Greg Zaal" name="Greg Zaal" role="Director, HDRIs" country="ZA" mode="compact" />
                <Staff id="Rob Tuytel" name="Rob Tuytel" role="Co-founder, Textures" country="NL" mode="compact" />
                <Staff id="Rico Cilliers" name="Rico Cilliers" role="Models, Textures" country="ZA" mode="compact" />
                <div className={styles.dummy} />
              </div>
              <div className={styles.avatarRow}>
                <Staff id="James Ray Cock" name="James Ray Cock" role="Models" country="ZA" mode="compact" />
                <Staff id="Andreas Mischok" name="Andreas Mischok" role="HDRIs" country="DE" mode="compact" />
                <Staff id="Sergej Majboroda" name="Sergej Majboroda" role="HDRIs" country="UL" mode="compact" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TODO User renders */}
      {/* <div className={styles.sectionWrapper}>
        <div className={styles.section}>
          <div className={styles.subSection}>
            <h2>User Renders</h2>
          </div>
        </div>
      </div> */}

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
