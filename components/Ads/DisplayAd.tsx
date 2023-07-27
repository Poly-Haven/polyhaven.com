import { useTranslation } from 'next-i18next'
import { useState, useEffect } from 'react'

import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'

import styles from './Ads.module.scss'

const DisplayAd = ({ id, x, y, showRemoveBtn }) => {
  const { t } = useTranslation('common')

  const isProduction = process.env.NODE_ENV === 'production'

  useEffect(() => {
    if (isProduction && localStorage.getItem(`hideAds`) !== 'yes') {
      try {
        // @ts-ignore - adsbygoogle not detected as a prop of window
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (err) {
        console.error(err)
      }
    }
  }, [id])

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
        key={id}
        className="adsbygoogle"
        style={{ display: 'inline-block', width: `${x}px`, height: `${y}px` }}
        data-ad-client="ca-pub-2284751191864068"
        data-ad-slot={id}
      ></ins>
      {jsxRemoveAds}
    </>
  )
}

DisplayAd.defaultProps = {
  showRemoveBtn: false,
}

export default DisplayAd
