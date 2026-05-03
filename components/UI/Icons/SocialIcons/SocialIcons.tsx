import { SiDiscord } from 'react-icons/si'
import { SiPatreon } from 'react-icons/si'
import { SiFacebook } from 'react-icons/si'
import { SiInstagram } from 'react-icons/si'
import { SiYoutube } from 'react-icons/si'
import { SiMastodon } from 'react-icons/si'
import { SiBluesky } from 'react-icons/si'
import { SiX } from 'react-icons/si'
import { SiRss } from 'react-icons/si'

import styles from './SocialIcons.module.scss'

const SocialIcons = () => {
  return (
    <div className={styles.communityIcons}>
      <a href="https://discord.gg/Dms7Mrs" aria-label="Discord">
        <SiDiscord />
      </a>
      <a href="https://www.patreon.com/polyhaven/overview" aria-label="Patreon">
        <SiPatreon />
      </a>
      <a rel="me" href="https://masto.ai/@polyhaven" aria-label="Mastodon">
        <SiMastodon />
      </a>
      <a rel="me" href="https://bsky.app/profile/polyhaven.com" aria-label="Bluesky">
        <SiBluesky />
      </a>
      <br />
      <a href="https://www.facebook.com/polyhaven" aria-label="Facebook">
        <SiFacebook />
      </a>
      <a href="https://x.com/polyhaven" aria-label="X">
        <SiX />
      </a>
      <a href="https://www.instagram.com/polyhaven" aria-label="Instagram">
        <SiInstagram />
      </a>
      <a href="https://www.youtube.com/c/PolyHaven" aria-label="YouTube">
        <SiYoutube />
      </a>
      <a href="https://api.polyhaven.com/rss" aria-label="RSS feed">
        <SiRss />
      </a>
    </div>
  )
}

export default SocialIcons
