import { SiDiscord } from "react-icons/si";
import { SiPatreon } from "react-icons/si";
import { SiFacebook } from "react-icons/si";
import { SiTwitter } from "react-icons/si";
import { SiInstagram } from "react-icons/si";
import { SiYoutube } from "react-icons/si";

import styles from './SocialIcons.module.scss'

const SocialIcons = () => {
  return (
    <div className={styles.communityIcons}>
      <a href="https://discord.gg/Dms7Mrs"><SiDiscord /></a>
      <a href="https://www.patreon.com/polyhaven/overview"><SiPatreon /></a>
      <a href="https://www.facebook.com/polyhaven"><SiFacebook /></a>
      <a href="https://twitter.com/polyhaven"><SiTwitter /></a>
      <a href="https://www.instagram.com/polyhaven"><SiInstagram /></a>
      <a href="https://www.youtube.com/c/PolyHaven"><SiYoutube /></a>
    </div>
  )
}

export default SocialIcons
