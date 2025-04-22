import { useState, useEffect, useRef } from 'react'
import useStoredState from 'hooks/useStoredState'

import { MdClose } from 'react-icons/md'

import styles from './Ads.module.scss'
import Button from 'components/UI/Button/Button'

const DisplayAd = ({ id, x, y, showRemoveBtn }) => {
  const [isServer, setIsServer] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1100)
  const [hideNoMoreAds, setHideNoMoreAds] = useStoredState('hide_nomoreads', false)
  const adRef = useRef(null)

  useEffect(() => {
    function handleResize() {
      if (windowWidth !== window.innerWidth) setWindowWidth(window.innerWidth)
    }

    handleResize() // First call

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isServer && windowWidth < 1100) {
      setIsMobile(true)
    } else if (isMobile && windowWidth >= 1100) {
      setIsMobile(false)
    }
  }, [windowWidth])

  useEffect(() => {
    setIsServer(false)
  }, [])

  // return null // TESTING for adblock/patrons

  if (isServer || localStorage.getItem(`hideAds`) === 'yes' || isMobile || hideNoMoreAds) {
    return null
  }

  return (
    <div className={`${styles.noAds} ${styles[id]}`} ref={adRef}>
      <h2>
        <span>🎉</span>No more ads!
      </h2>
      <p>
        This used to be an ad.
        <br />
        <a href="https://www.patreon.com/posts/123051545">Thanks to your support</a>, we've just removed all ads from
        Poly Haven.
      </p>
      <div style={{ whiteSpace: 'nowrap', margin: '0 1em' }}>
        <Button text="Support Us" href="https://www.patreon.com/polyhaven" color="red" />
      </div>
      <div className={styles.close} onClick={() => setHideNoMoreAds(true)} title="Permanently hide this message">
        <MdClose />
      </div>
    </div>
  )
}

DisplayAd.defaultProps = {
  showRemoveBtn: false,
}

export default DisplayAd
