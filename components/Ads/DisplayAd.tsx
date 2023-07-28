import { useTranslation } from 'next-i18next'
import { useState, useEffect, useRef } from 'react'

import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'

import styles from './Ads.module.scss'

const DisplayAd = ({ id, x, y, showRemoveBtn }) => {
  const { t } = useTranslation('common')
  const adRef = useRef(null)

  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (isProduction && adRef.current && localStorage.getItem(`hideAds`) !== 'yes') {
      try {
        // console.log(`Loading ad ${id}`, adRef.current, window.adsbygoogle)
        // @ts-ignore - adsbygoogle not detected as a prop of window
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
        // console.log(`Loaded ad ${id}`, window.adsbygoogle)
      } catch (err) {
        console.error(err)
      }
    }
  }, [adRef.current])

  const jsxRemoveAds = showRemoveBtn ? (
    <Button
      text={
        <>
          {t('remove-ads')}
          <Heart />
        </>
      }
      href="/account"
      style={{
        margin: '4px 0',
        padding: '0.2em 0',
        width: `${x}px`,
      }}
    />
  ) : null

  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])

  if (isServer || localStorage.getItem(`hideAds`) === 'yes') {
    return null
  }

  if (!isProduction) {
    return (
      <>
        <img src={`https://placekitten.com/${x}/${y}`} className={styles.placeholder} />
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
