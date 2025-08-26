import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useUserPatron } from 'contexts/UserPatronContext'

import InfoBox from 'components/UI/InfoBox/InfoBox'
import Button from 'components/UI/Button/Button'
import Patreon from 'components/UI/Icons/Patreon'
import Fab from 'components/UI/Icons/Fab'

import {
  MdApps,
  MdOutlineInstallDesktop,
  MdInfo,
  MdDownload,
  MdOpenInNew,
  MdCloudDownload,
  MdDashboard,
} from 'react-icons/md'
import { RiVipCrownLine } from 'react-icons/ri'
import { SiDiscord } from 'react-icons/si'

import styles from './Plugins.module.scss'
import buttonStyles from 'components/UI/Button/Button.module.scss'

const CallToAction = ({ hasAccess }) => {
  return (
    <div className={styles.row}>
      <a
        href={
          hasAccess
            ? 'https://www.patreon.com/posts/70974704'
            : 'https://www.patreon.com/join/polyhaven/checkout?rid=6545111'
        }
        className={`${styles.purchaseOption} ${
          hasAccess ? styles.ownedPurchaseOption : styles.recommendedPurchaseOption
        }`}
      >
        <Patreon />
        <h3>Patreon</h3>
        <p>
          <strong>$5</strong>/month
        </p>
        <p>
          Cancel any time
          <br />
          All proceeds go to Poly Haven
        </p>
        {hasAccess ? (
          <div className={`${buttonStyles.button} ${buttonStyles.pink}`}>
            <div className={buttonStyles.inner}>Download</div>
          </div>
        ) : (
          <div className={`${buttonStyles.button} ${buttonStyles.accent}`}>
            <div className={buttonStyles.inner}>Sign up</div>
          </div>
        )}
      </a>
      <p className={styles.callToAction}>or</p>
      <a href="https://fab.com/s/967e3c3f02e4" className={styles.purchaseOption}>
        <Fab color="white" />
        <h3>Fab</h3>
        <p>
          <strong>$30</strong>
        </p>
        <p>
          Once-off purchase
          <br />
          <abbr title="Poly Haven receives 44% of the payment, Epic Games takes 12%, and the developer receives the rest.">
            Revenue shared
          </abbr>{' '}
          with Poly Haven
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

const Unreal = ({ numAssets }) => {
  const { patron } = useUserPatron()

  const hasAccess = patron.rewards && patron.rewards.includes('Offline Access')

  return (
    <div className={styles.wrapper}>
      <h1>HDRI Browser for the Unreal Engine</h1>

      {hasAccess && (
        <InfoBox
          type="download"
          header="Download"
          icon={<MdDownload />}
          side={
            <Button
              text="Download on Patreon"
              href="https://www.patreon.com/posts/70974704"
              color="pink"
              icon={<MdOpenInNew />}
            />
          }
        >
          <div>
            <p>
              <strong>Thanks for your support!</strong>
            </p>
            <p>
              Looking for the download link? It's available at the bottom of{' '}
              <a href="https://www.patreon.com/posts/70974704">this post</a> on Patreon.
            </p>
          </div>
        </InfoBox>
      )}

      <p className={styles.subtitle}>
        An unofficial plugin to accelerate your Unreal Engine lighting workflow with a native Poly Haven HDRI browser
        built into UE5.
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
      <p className={styles.callToAction}>Choose your path...</p>

      <CallToAction hasAccess={hasAccess} />

      <p>
        Whether you get it on Fab or Patreon, the plugin is identical. Both versions have the same features and perks,
        including...
      </p>
      <div className={styles.row}>
        <div className={styles.primaryFeature}>
          <MdApps className={styles.green} />
          <h3>{numAssets} HDRIs and Counting...</h3>
          <p>All of our current and future HDRIs at your fingertips, new HDRIs added monthly.</p>
        </div>
        <div className={styles.primaryFeature}>
          <MdCloudDownload className={styles.yellow} />
          <h3>One-click Downloads</h3>
          <p>With live previews, background downloads, and resolution control.</p>
        </div>
        <div className={styles.primaryFeature}>
          <MdDashboard className={styles.blue} />
          <h3>Editor-native UI</h3>
          <p>Feels at home in Unreal, access directly from the content browser.</p>
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
      <CallToAction hasAccess={hasAccess} />
      <div className={styles.spacer} />

      <div style={{ textAlign: 'center' }}>
        <Button
          text="Documentation and User Guide"
          href="https://www.munduscreatus.be/hdri-browser-documentation/"
          icon={<MdInfo />}
        />
        <Button text="Community Support" href="https://discord.gg/Dms7Mrs" color="hollow" icon={<SiDiscord />} />
      </div>
    </div>
  )
}

export default Unreal
