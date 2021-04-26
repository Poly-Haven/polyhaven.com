import { SiDiscord } from "react-icons/si";
import { SiPatreon } from "react-icons/si";
import { SiFacebook } from "react-icons/si";
import { SiTwitter } from "react-icons/si";
import { SiYoutube } from "react-icons/si";

import styles from './SocialIcons.module.scss'

const SocialIcons = () => {
  return (
    <div className={styles.communityIcons}>
      <a href="https://discord.gg/Dms7Mrs"><SiDiscord /></a>
      <a href="https://polyhaven.com/support-us"><SiPatreon /></a>
      <a href="https://polyhaven.com/facebook"><SiFacebook /></a>
      <a href="https://polyhaven.com/twitter"><SiTwitter /></a>
      <a href="https://www.youtube.com/c/PolyHaven"><SiYoutube /></a>
    </div>
  )
}

export default SocialIcons
