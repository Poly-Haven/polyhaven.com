import { useTranslation } from 'next-i18next'
import { useState, useRef, useEffect } from 'react'
import useDivSize from 'hooks/useDivSize'

import styles from './Slider.module.scss'

const Slider = () => {
  const { t } = useTranslation('common')
  const [imageIndex, setImageIndex] = useState(null)
  const [transitionBusy, setTransitionBusy] = useState(false)
  const [images, setImages] = useState([
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'grassland_ruine.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'river_autumn2.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'forest_farmhouse.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'river_winter1.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'medieval_urban_village.jpg',
    },
    {
      credit: 'Oleksii',
      link: 'https://www.behance.net/alexgoshenskiy',
      filename: 'Jungle mansion.jpg',
    },
  ])

  const wrapperRef = useRef(null)
  const { width, height } = useDivSize(wrapperRef)
  const imageA = useRef(null)
  const imageB = useRef(null)

  // Initialize
  useEffect(() => {
    if (imageIndex === null) {
      setImageIndex(0)
    }
  }, [width])

  // Image change
  useEffect(() => {
    if (!width || !height || imageIndex === null) return
    setTransitionBusy(true)

    const renderCurrent = images[imageIndex % images.length]
    const renderNext = images[(imageIndex + 1) % images.length]

    const imgCurrent = imageIndex % 2 ? imageB : imageA
    const imgNext = imageIndex % 2 ? imageA : imageB

    const urlParams = {
      aspect_ratio: `${width}:${height}`,
      width: width,
      height: height,
    }
    const urlParamsStr = Object.entries(urlParams)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    const urlCurrent = encodeURI(
      `https://cdn.polyhaven.com/site_images/home/slider/${renderCurrent.filename}?${urlParamsStr}`
    )
    const urlNext = encodeURI(
      `https://cdn.polyhaven.com/site_images/home/slider/${renderNext.filename}?${urlParamsStr}`
    )

    imgCurrent.current.style.background = `url(${urlCurrent}) no-repeat center center`
    imgCurrent.current.style.backgroundSize = `cover`
    imgCurrent.current.style.zIndex = 3

    // Wait until after transition to fetch next image
    setTimeout(() => {
      imgNext.current.style.zIndex = 1
      imgCurrent.current.style.zIndex = 2
      imgNext.current.style.background = `url(${urlNext}) no-repeat center center`
      setTransitionBusy(false)
    }, 1500)
  }, [imageIndex])

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
      onClick={(_) => {
        if (transitionBusy) return
        setImageIndex(imageIndex + 1)
      }}
    >
      <div className={styles.placeholder} />
      <div
        className={`${styles.sliderImage} ${imageIndex === null || imageIndex % 2 ? styles.hidden : styles.visible}`}
        ref={imageA}
      />
      <div className={`${styles.sliderImage} ${imageIndex % 2 ? styles.visible : styles.hidden}`} ref={imageB} />
      <img src="/Logo 256.png" className={styles.logo} />
      <h1>Poly Haven</h1>
      <p>{t('tagline')}</p>
    </div>
  )
}

export default Slider
