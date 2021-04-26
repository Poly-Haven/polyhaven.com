import Link from 'next/link';

import { randomArraySelection } from 'utils/arrayUtils'

import { SiDiscord } from "react-icons/si";
import { SiPatreon } from "react-icons/si";
import { SiFacebook } from "react-icons/si";
import { SiTwitter } from "react-icons/si";

import Todo from 'components/Todo/Todo'

import styles from './Footer.module.scss';

const footer = () => {
  const example_names = [
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
  let names_list = [];
  for (let i = 0; i < 1040; i++) {
    names_list[i] = example_names[Math.floor(Math.random() * example_names.length)];
  }
  const pledge_rank_weights = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];


  // TODO Patreon connection
  return (
    <div id={styles.footer}>
      <h2>Patrons</h2>
      <div className={styles.patrons}>
        {names_list.map((n, i) => <p key={i} className={styles[`patron-rank-${randomArraySelection(pledge_rank_weights)}`]}>{n}</p>)}
      </div>
      <Todo>TODO Corporate Sponsor Logos</Todo>
      <div className={styles.linksWrapper}>
        <div className={styles.links}>
          <Link href="/"><a>
            <div className={styles.logoWrapper}>
              <img src='/Logo 256.png' className={styles.logo} />
              <h1>Poly Haven</h1>
              <p>The Public Asset Library</p>
            </div>
          </a></Link>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link href="/about-contact"><a>About</a></Link>
              <Link href="/about-contact"><a>Contact</a></Link>
              <Link href="https://bit.ly/ph-advertising"><a>Advertising</a></Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link href="/license"><a>License</a></Link>
              <Link href="/privacy"><a>Privacy</a></Link>
              <Link href="/finance-reports"><a>Finance Reports</a></Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link href="/faq"><a>FAQ</a></Link>
              <Link href="/contribute"><a>Contribute</a></Link>
              <Link href="https://blog.hdrihaven.com"><a>Blog</a></Link>
            </div>
          </div>
          <div className={styles.communityIcons}>
            <a href="https://discord.gg/Dms7Mrs"><SiDiscord /></a>
            <a href="https://polyhaven.com/support-us"><SiPatreon /></a>
            <a href="https://polyhaven.com/facebook"><SiFacebook /></a>
            <a href="https://polyhaven.com/twitter"><SiTwitter /></a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default footer;