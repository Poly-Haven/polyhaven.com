import { useState, useEffect } from 'react'
import Link from 'next/link'

import InfoBox from 'components/UI/InfoBox/InfoBox'
import Button from 'components/UI/Button/Button'
import Patreon from 'components/UI/Icons/Patreon'
import BlenderMarket from 'components/UI/Icons/BlenderMarket'
import Heart from 'components/UI/Icons/Heart'

import { MdApps, MdOutlineInstallDesktop } from 'react-icons/md'
import { RiVipCrownLine } from 'react-icons/ri'

import styles from './Plugins.module.scss'
import buttonStyles from 'components/UI/Button/Button.module.scss'

const CallToAction = () => {
  return (
    <div className={styles.row}>
      <a
        href="https://www.patreon.com/join/polyhaven/checkout?rid=6545111"
        className={`${styles.purchaseOption} ${styles.recommendedPurchaseOption}`}
      >
        <Patreon />
        <h3>Patreon</h3>
        <p>
          <strong>$5</strong>/month
        </p>
        <p>
          Includes other rewards
          <br />
          Cancel any time
        </p>
        <div className={`${buttonStyles.button} ${buttonStyles.accent}`}>
          <div className={buttonStyles.inner}>Sign up</div>
        </div>
      </a>
      <p className={styles.callToAction}>or</p>
      <a href="https://blendermarket.com/products/poly-haven-asset-browser" className={styles.purchaseOption}>
        <BlenderMarket />
        <h3>Blender Market</h3>
        <p>
          <strong>$30</strong>
        </p>
        <p>
          Once-off purchase
          <br />
          Free updates forever
        </p>
        <div className={`${buttonStyles.button} ${buttonStyles.accent}`}>
          <div className={buttonStyles.inner}>Purchase</div>
        </div>
      </a>
    </div>
  )
}

const Feature = ({ title, image, hover, children }) => {
  const [flicker, setFlicker] = useState(false)
  const [visible, setVisible] = useState(true)

  // Flicker the hover image
  useEffect(() => {
    setInterval(() => {
      setVisible((visible) => !visible)
    }, 650)
  }, [])

  return (
    <div
      className={styles.feature}
      onMouseEnter={(_) => {
        setFlicker(true)
        setVisible(true)
      }}
      onMouseLeave={(_) => {
        setFlicker(false)
        setVisible(false)
      }}
    >
      <div className={styles.featureText}>
        <h3>{title}</h3>
        {children}
      </div>
      <div className={styles.images}>
        <img src={image} />
        <img src={hover} className={`${styles.hover} ${visible && flicker ? null : styles.hidden}`} />
      </div>
    </div>
  )
}

const Blender = ({ numAssets }) => {
  return (
    <div className={styles.wrapper}>
      <h1>Poly Haven Asset Browser for Blender</h1>
      <p className={styles.subtitle}>
        We made an add-on for Blender that pulls all our assets into the asset browser, making it easy for you to drag
        and drop HDRIs, materials and 3D models into your scene without having to visit the website.
      </p>
      <video
        autoPlay={false}
        controls={true}
        loop={true}
        disablePictureInPicture={true}
        disableRemotePlayback={true}
        muted={true}
      >
        <source src="https://u.polyhaven.org/ZL5/demo_video.mp4" type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
      <hr />
      <InfoBox type="info" header="This is a paid product">
        <p>
          While all our assets are 100% free and <Link href="/license">CC0</Link>, we are exploring the idea of funding
          our work by selling tools like this to make it easier for you to use our free assets.
        </p>
        <p>
          So far the sales of this add-on alone have allowed us to hire new artists and set up a studio to capture more
          assets, work on R&D of entire new asset types, and travel around the world to capture free content for
          everyone.
        </p>
        <p>
          Thanks for your support! <Heart color="#F96854" />
        </p>
      </InfoBox>
      <p className={styles.callToAction}>Choose your path...</p>

      <CallToAction />

      <p>
        Whether you get it on the Blender Market or Patreon, the add-on is identical. Both versions have the same
        features and perks, including...
      </p>
      <div className={styles.row}>
        <div className={styles.primaryFeature}>
          <MdApps className={styles.green} />
          <h3>{numAssets} Assets and Counting...</h3>
          <p>All of our current and future assets at your fingertips, with new stuff nearly every day.</p>
        </div>
        <div className={styles.primaryFeature}>
          <RiVipCrownLine className={styles.yellow} />
          <h3>Early Access</h3>
          <p>Stand out from the crowd, use content that will only be public months from now.</p>
        </div>
        <div className={styles.primaryFeature}>
          <MdOutlineInstallDesktop className={styles.blue} />
          <h3>Offline Use</h3>
          <p>Assets can be used even when offline, at 1K plus any resolutions downloaded previously.</p>
        </div>
      </div>

      <div className={styles.spacer} />
      <h1>Features:</h1>
      <Feature
        title="Organized catalogs"
        image="https://cdn.polyhaven.com/site_images/plugins/blender/feat1h.png"
        hover="https://cdn.polyhaven.com/site_images/plugins/blender/feat1.png"
      >
        <p>
          Assets are organized according to our categories and asset types, making it easy to filter through the lists
          and quickly find what you need.
        </p>
        <p>Our tags are also added automatically as well, meaning you can search for specific keywords too.</p>
      </Feature>
      <Feature
        title="Resolution switching"
        image="https://cdn.polyhaven.com/site_images/plugins/blender/feat2h.png"
        hover="https://cdn.polyhaven.com/site_images/plugins/blender/feat2.png"
      >
        <p>
          By default assets will be imported at 1K resolution for quick previews, but you can swap to higher resolutions
          at any time. Most assets are available at least at 8K resolution.
        </p>
        <p>
          Switching to a new resolution will download the files from our server and keep them on your hard drive for
          faster switching next time.
        </p>
      </Feature>
      <Feature
        title="Auto texture scale"
        image="https://cdn.polyhaven.com/site_images/plugins/blender/feat3h.png"
        hover="https://cdn.polyhaven.com/site_images/plugins/blender/feat3.png"
      >
        <p>
          No more eye-balling texture sizes. Simply click the "Fix Texture Scale" button and the add-on will compare the
          known dimensions of our texture to your mesh surface area, calculate the exact scale multiplier and set this
          on the mapping node to get things looking right.
        </p>
      </Feature>
      <Feature
        title="One-click displacement setup"
        image="https://cdn.polyhaven.com/site_images/plugins/blender/feat4h.png"
        hover="https://cdn.polyhaven.com/site_images/plugins/blender/feat4.png"
      >
        <p>
          Almost all of our materials are designed to be used with real mesh displacement, using tessellation/adaptive
          subdivision.
        </p>
        <p>
          There are a few settings to change in Blender and modifiers to set up in order to get this working correctly.
          Rather than doing that manually, there is a "Set up displacement" button in the material panel.
        </p>
      </Feature>

      <div className={styles.spacer} />
      <p className={styles.callToAction}>Get it now:</p>
      <CallToAction />
      <div className={styles.spacer} />

      <div style={{ textAlign: 'center' }}>
        <Button text="Documentation and User Guide" href="https://docs.polyhaven.com/en/guides/blender-addon" />
        <Button
          text="Troubleshooting and Bug Reports"
          href="https://docs.polyhaven.com/en/guides/blender-addon#troubleshooting"
          color="hollow"
        />
      </div>
    </div>
  )
}

export default Blender
