import Link from 'next/link';

import { randomArraySelection } from 'utils/arrayUtils'

import Todo from 'components/Todo/Todo'
import Button from 'components/Button/Button'
import SocialIcons from 'components/SocialIcons/SocialIcons'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'

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

  const patronNamesJSX = (<>{names_list.map((n, i) => <p key={i} className={styles[`patron-rank-${randomArraySelection(pledge_rank_weights)}`]}>{n}</p>)}</>);


  // TODO Patreon connection
  return (
    <div id={styles.footer}>
      <h2>Patrons</h2>
      <Todo>Note: Placeholder names</Todo>
      <div className={styles.patrons}>
        <div className={styles.patronsScrollWrapper}>
          <div className={styles.patronsScroll}>
            <div className={styles.patronsSetA}>
              {patronNamesJSX}
            </div>
          </div>
        </div>
      </div>
      <CorporateSponsors footer={true} />
      <Button text="Join the ranks, support Poly Haven on Patreon" href="https://www.patreon.com/hdrihaven/overview" />
      <div className={styles.linksWrapper}>
        <a id="social" />
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
              <Link href="/faq"><a>FAQ</a></Link>
              <Link href="/about-contact"><a>About</a></Link>
              <Link href="/about-contact"><a>Contact</a></Link>
              <Link href="/map"><a>Map</a></Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link href="/license"><a>License</a></Link>
              <Link href="/privacy"><a>Privacy</a></Link>
              <Link href="/finance-reports"><a>Finance Reports</a></Link>
              <Link href="https://bit.ly/ph-advertising"><a>Advertising</a></Link>
            </div>
          </div>
          <div className={styles.linkListWrapper}>
            <div className={styles.linkList}>
              <Link href="https://blog.hdrihaven.com"><a>Blog</a></Link>
              <Link href="/contribute"><a>Contribute</a></Link>
              <Link href="https://github.com/Poly-Haven/Public-API"><a>API</a></Link>
              <Link href="https://github.com/Poly-Haven/polyhaven.com"><a>Source</a></Link>
            </div>
          </div>
          <SocialIcons />
        </div>
      </div>
    </div>
  );
}

export default footer;