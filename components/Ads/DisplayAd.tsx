import { useTranslation } from 'next-i18next'
import { useState, useEffect, useRef } from 'react'

import Button from 'components/UI/Button/Button'

import styles from './Ads.module.scss'

const DisplayAd = ({ id, x, y, showRemoveBtn }) => {
  const { t } = useTranslation('common')
  const [isServer, setIsServer] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [windowWidth, setWindowWidth] = useState(1100)
  const adRef = useRef(null)

  const isProduction = process.env.NODE_ENV === 'production'

  // TEMP Uncomment after architextures ads
  // useEffect(() => {
  //   if (!isLoaded && isProduction && !isServer && adRef.current && localStorage.getItem(`hideAds`) !== 'yes') {
  //     try {
  //       // @ts-ignore - adsbygoogle not detected as a prop of window
  //       ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  //       setIsLoaded(true)
  //     } catch (err) {
  //       console.error(err)
  //     }
  //   }
  // }, [adRef.current, isServer])

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

  const jsxRemoveAds = showRemoveBtn ? (
    <Button
      text={<>{t('remove-ads')} ($1)</>}
      href="/account"
      style={{
        margin: '4px 0',
        padding: '0.2em 0',
        width: `${x}px`,
      }}
    />
  ) : null

  useEffect(() => {
    setIsServer(false)
  }, [])

  // return null // TESTING for adblock/patrons

  if (isServer || localStorage.getItem(`hideAds`) === 'yes' || isMobile) {
    return null
  }

  // TEMP architextures
  const links = {
    '160x600': 'https://architextures.org/create/152?ref=polyhaven-4',
    '728x90': 'https://architextures.org/create/132?ref=polyhaven-2',
    '336x280': 'https://architextures.org/create/share/37274?ref=polyhaven-3',
    '970x250': 'https://architextures.org/create/812?ref=polyhaven-1',
  }
  const fileNames = {
    '160x600': 'architextures1',
    '728x90': 'architextures2',
    '336x280': 'architextures3',
    '970x250': 'architextures4',
  }
  return (
    <>
      <a href={links[`${x}x${y}`] || 'https://architextures.org/?ref=polyhaven-0'} rel="noopener">
        <img
          src={`https://ads.polyhaven.org/architextures/${fileNames[`${x}x${y}`]}.webp`}
          style={{ display: 'inline-block', width: `${x}px`, height: `${y}px` }}
        />
      </a>
      {jsxRemoveAds}
    </>
  )

  if (!isProduction || localStorage.getItem(`dummyAds`)) {
    return (
      <>
        <img src={`https://picsum.photos/${x}/${y}`} className={styles.placeholder} />
        {jsxRemoveAds}
      </>
    )
  }

  return (
    <>
      <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
      <ins
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${x}px`, height: `${y}px` }}
        data-ad-client="ca-pub-2284751191864068"
        data-ad-slot={id}
        ref={adRef}
      ></ins>
      {jsxRemoveAds}
    </>
  )
}

DisplayAd.defaultProps = {
  showRemoveBtn: false,
}

export default DisplayAd
