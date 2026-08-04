import { ReactNode } from 'react'
import Link from 'next/link'
import { MdRocketLaunch, MdOpenInNew, MdCheck } from 'react-icons/md'

import Patreon from 'components/UI/Icons/Patreon'
import Button from 'components/UI/Button/Button'

import styles from './CourseCallToAction.module.scss'

/*
 * Pricing block for the course pages — extracted and adjusted from the plugin
 * pages' CallToAction (Patreon vs Superhive cards), with green-check feature
 * lists instead of the centered prose descriptions.
 */

type Props = {
  hasAccess: boolean
  watchHref: string
  signInHref: string
  patreonUrl: string
  patreonPrice: string
  patreonFeatures: string[]
  secondaryUrl: string
  secondaryIcon: ReactNode
  secondaryTitle: string
  secondaryPrice: string
  secondaryFeatures: string[]
}

const Features = ({ items }: { items: string[] }) => (
  <ul className={styles.features}>
    {items.map((f) => (
      <li key={f}>
        <MdCheck /> {f}
      </li>
    ))}
  </ul>
)

const CourseCallToAction = ({
  hasAccess,
  watchHref,
  signInHref,
  patreonUrl,
  patreonPrice,
  patreonFeatures,
  secondaryUrl,
  secondaryIcon,
  secondaryTitle,
  secondaryPrice,
  secondaryFeatures,
}: Props) => {
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
          <strong>{patreonPrice}</strong>/month
        </p>
        <Features items={patreonFeatures} />
        {hasAccess ? (
          <Button text="Go to the course" href={watchHref} color="accent" icon={<MdRocketLaunch />} />
        ) : (
          <>
            <Button text="Join on Patreon" href={patreonUrl} color="accent" />
            <span className={styles.signin}>
              Already a patron? <Link href={signInHref}>Sign in</Link>
            </span>
          </>
        )}
      </div>

      <p className={styles.or}>or</p>

      <div className={styles.purchaseOption}>
        {secondaryIcon}
        <h3>{secondaryTitle}</h3>
        <p>
          <strong>{secondaryPrice}</strong> once-off
        </p>
        <Features items={secondaryFeatures} />
        <Button text="Buy on Superhive" href={secondaryUrl} color="accent" icon={<MdOpenInNew />} />
      </div>
    </div>
  )
}

export default CourseCallToAction
