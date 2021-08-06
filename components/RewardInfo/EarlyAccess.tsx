import Link from 'next/link';

import IconPatreon from 'components/UI/Icons/Patreon'

import styles from 'components/Library/Grid/GridItem/GridItem.module.scss'

const EarlyAccess = () => {
  return (
    <div>
      <h1>Early Access</h1>
      <p>Now that you're logged in, the <Link href='/all'>Asset Library</Link> will include assets that we've scheduled to publish in the future.</p>
      <p>They are marked by a blue circle and the Patreon logo in the top right, like this: <span style={{ display: 'inline-block' }}><span className={`${styles.badgeSample} ${styles.soon}`}><IconPatreon />Early<br />Access</span></span></p>
      <p>You can already download them, ahead of everyone else :)</p>
    </div>
  )
}

export default EarlyAccess
