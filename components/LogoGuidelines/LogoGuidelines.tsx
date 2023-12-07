import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import { MdDownload } from 'react-icons/md'

import styles from './LogoGuidelines.module.scss'

const Logo = ({ url, color }) => {
  return (
    <a href={url} className={color === 'dark' ? styles.logoBoxDark : styles.logoBoxLight}>
      <img src={url} />
    </a>
  )
}

const LogoGuidelines = () => {
  return (
    <div className={styles.wrapper}>
      <h1>Poly Haven Logo</h1>
      <p>
        While our assets are <Link href="/license">CC0</Link>, our logo is not :)
      </p>
      <p>
        Our logo is used to identify official Poly Haven projects and is not permitted to be used by third parties
        except...
      </p>
      <ol>
        <li>When giving credit or attribution for using our assets.</li>
        <li>By the press when talking about Poly Haven in articles, videos, and social media.</li>
        <li>Or with written permission from us.</li>
      </ol>

      <div className={styles.logoBoxes}>
        <Logo
          url="https://cdn.polyhaven.com/site_images/Poly Haven Logo Kit/Colored/Poly Haven Logo Colored Full White.svg"
          color="dark"
        />
        <Logo
          url="https://cdn.polyhaven.com/site_images/Poly Haven Logo Kit/Black/Poly Haven Logo Black Full.svg"
          color="light"
        />
        <Logo
          url="https://cdn.polyhaven.com/site_images/Poly Haven Logo Kit/White/Poly Haven Logo White Full.svg"
          color="dark"
        />
      </div>

      <div className={styles.buttonBox}>
        <Button
          text="Download Logo Kit"
          href="https://u.polyhaven.org/1XR/Poly%20Haven%20Logo%20Kit.zip"
          icon={<MdDownload />}
        />
      </div>

      <h2>Usage Guidelines</h2>
      <ul>
        <li>
          If used on a website, when possible, the logo must link to{' '}
          <Link href="https://polyhaven.com">polyhaven.com</Link>.
        </li>
        <li>You may not alter the shape, spacing, or fonts in the logo.</li>
        <li>
          You may not alter the colors in the logo, unless the logo appears as a solid color silhouette, where you may
          then change the color to suit your style as long as the logo is still clearly visible.
        </li>
        <li>Changing the color of the "Poly Haven" text to match your text color is also fine.</li>
        <li>Where space permits, use the full logo + "Poly Haven" text rather than just the "P" logo alone.</li>
      </ul>
      <h2>Prohibited Usage</h2>
      <ul>
        <li>
          Commercial usage of the logo is only permitted when you are an active{' '}
          <Link href="/corporate">Corporate Sponsor</Link>. Film or video game credits are not considered commercial
          usage.
        </li>
        <li>
          You may not display the logo more prominently than your own, nor should it appear as if the Poly Haven logo is
          your own logo.
        </li>
        <li>
          Usage of our logo should not imply any affiliation or partnership without an associated{' '}
          <Link href="/corporate">Corporate Sponsorship</Link> account.
        </li>
        <li>Use of the Poly Haven logo on merchandise and physical products is not permitted.</li>
      </ul>
      <p>
        If you have any questions, feel free to <Link href="/about-contact">contact us</Link>.
      </p>
    </div>
  )
}

export default LogoGuidelines
