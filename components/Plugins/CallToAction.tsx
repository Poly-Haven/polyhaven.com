import { useRouter } from 'next/router'
import Link from 'next/link'

import Patreon from 'components/UI/Icons/Patreon'

import styles from './Plugins.module.scss'
import buttonStyles from 'components/UI/Button/Button.module.scss'

const CallToAction = ({
  hasAccess,
  patreonDescription,
  patreonDownloadUrl,
  secondaryUrl,
  secondaryIcon,
  secondaryTitle,
  secondaryPrice,
  secondaryDescription,
}) => {
  const router = useRouter()
  return (
    <div className={styles.row}>
      <div
        className={`${styles.purchaseOption} ${
          hasAccess ? styles.ownedPurchaseOption : styles.recommendedPurchaseOption
        }`}
      >
        <Patreon />
        <h3>Patreon</h3>
        <p>
          <strong>$5</strong>/month
        </p>
        {patreonDescription}
        {hasAccess ? (
          <a href={patreonDownloadUrl} className={`${buttonStyles.button} ${buttonStyles.pink}`}>
            <div className={buttonStyles.inner}>Download</div>
          </a>
        ) : (
          <>
            <a
              href="https://www.patreon.com/join/polyhaven/checkout?rid=6545111&cadence=12"
              className={`${buttonStyles.button} ${buttonStyles.accent}`}
            >
              <div className={buttonStyles.inner}>Sign up</div>
            </a>
            <span className={styles.orText}>
              or <Link href={`/account?returnTo=${encodeURIComponent(router.asPath)}`}>sign in</Link>
            </span>
          </>
        )}
      </div>
      <p className={styles.callToAction}>or</p>
      <a href={secondaryUrl} className={styles.purchaseOption}>
        {secondaryIcon}
        <h3>{secondaryTitle}</h3>
        <p>
          <strong>{secondaryPrice}</strong>
        </p>
        {secondaryDescription}
        <div className={`${buttonStyles.button} ${buttonStyles.accent}`}>
          <div className={buttonStyles.inner}>Purchase</div>
        </div>
      </a>
    </div>
  )
}

export default CallToAction
