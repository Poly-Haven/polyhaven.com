import { useUserPatron } from 'contexts/UserPatronContext'

import InfoBox from 'components/UI/InfoBox/InfoBox'
import Button from 'components/UI/Button/Button'
import Patreon from 'components/UI/Icons/Patreon'
import Fab from 'components/UI/Icons/Fab'

import { MdApps, MdInfo, MdDownload, MdOpenInNew, MdCloudDownload, MdDashboard } from 'react-icons/md'
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

const Feature = ({ title, image, children }) => {
  return (
    <div className={styles.feature}>
      <div className={styles.featureText}>
        <h3>{title}</h3>
        {children}
      </div>
      <div className={styles.images}>
        <img src={image} />
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
        poster="https://u.polyhaven.org/t5T/demo_web_uehdribrowser.jpg"
      >
        <source src="https://u.polyhaven.org/JC6/demo_web_uehdribrowser.mp4" type="video/mp4" />
        Sorry, your browser doesn't support embedded videos.
      </video>
      <hr />
      <p className={styles.callToAction}>Choose your path...</p>

      <CallToAction hasAccess={hasAccess} />

      <p style={{ textAlign: 'center' }}>
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
      <Feature title="Fast in-editor search" image="https://cdn.polyhaven.com/site_images/plugins/unreal/feat1.png">
        <p>
          Search, filter, and browse HDRIs directly within the Unreal Engine editor using tags and categories, powered
          by the Poly Haven API.
        </p>
        <p>Find the perfect environment quickly without leaving your workflow.</p>
      </Feature>
      <Feature
        title="One-click Download, Import, Apply"
        image="https://cdn.polyhaven.com/site_images/plugins/unreal/feat2h.png"
      >
        <p>
          Streamlined workflow with live preview and scene restore functionality. Preview HDRIs instantly, then download
          and import the ones you want at full resolution.
        </p>
        <p>Background downloads ensure you can keep working while HDRIs are being fetched and cached locally.</p>
      </Feature>
      <Feature title="Configurable resolution" image="https://cdn.polyhaven.com/site_images/plugins/unreal/feat3h.png">
        <p>
          Start with low-resolution previews for quick iteration, then download the final HDRI at your preferred
          resolution up to 8K. Local cache control means faster access to previously downloaded HDRIs.
        </p>
        <p>Perfect for both rapid prototyping and final production work.</p>
      </Feature>
      <Feature
        title="HDRI Backdrop integration"
        image="https://cdn.polyhaven.com/site_images/plugins/unreal/feat4h.png"
      >
        <p>
          Seamlessly works with Unreal's HDRI Backdrop system. The plugin can spawn or reuse existing backdrops and
          automatically restore original cubemaps after previewing.
        </p>
        <p>Ideal for virtual production workflows and accurate lighting setups.</p>
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
