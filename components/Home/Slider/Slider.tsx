import { useTranslation } from 'next-i18next'
import { useState, useRef, useEffect } from 'react'
import useDivSize from 'hooks/useDivSize'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

import styles from './Slider.module.scss'

const mod = (a, b) => {
  // Replacement for % that supports negative numbers.
  return ((a % b) + b) % b
}

const Slider = () => {
  const { t } = useTranslation('common')
  const [imageIndex, setImageIndex] = useState(null)
  const [transitionBusy, setTransitionBusy] = useState(false)
  const [userInControl, setUserInControl] = useState(false)
  const [tick, setTick] = useState(0)
  const [images, setImages] = useState([
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'grassland_ruine.jpg',
    },
    {
      credit: 'Oleksii',
      link: 'https://www.behance.net/alexgoshenskiy',
      filename: 'Jungle mansion.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'river_winter1.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'forest_farmhouse.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'river_autumn2.jpg',
    },
    {
      credit: 'Rob Tuytel',
      link: 'https://www.artstation.com/tuytel',
      filename: 'medieval_urban_village.jpg',
    },
  ])

  const wrapperRef = useRef(null)
  const { width, height } = useDivSize(wrapperRef)
  const imageA = useRef(null)
  const imageB = useRef(null)

  // Initialize
  useEffect(() => {
    if (imageIndex === null) {
      setTimeout((_) => {
        // First tick happens after 5 seconds
        setTick((tick) => tick + 1)
        setInterval((_) => {
          // Subsequent ticks happen every 9 seconds
          setTick((tick) => tick + 1)
        }, 9000)
      }, 5000)
    }
  }, [width])

  // Auto change image on tick
  useEffect(() => {
    if (!userInControl && !transitionBusy) {
      setImageIndex(imageIndex === null ? 0 : imageIndex + 1)
    }
  }, [tick])

  // Image change
  useEffect(() => {
    if (!width || !height || imageIndex === null) return
    setTransitionBusy(true)

    const renderCurrent = images[mod(imageIndex, images.length)]
    const renderNext = images[mod(imageIndex + 1, images.length)]

    const imgCurrent = mod(imageIndex, 2) ? imageB : imageA
    const imgNext = mod(imageIndex, 2) ? imageA : imageB

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

  const render = images[mod(imageIndex, images.length) || 0]

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.placeholder} />
      <div
        className={`${styles.sliderImage} ${
          imageIndex === null || mod(imageIndex, 2) ? styles.hidden : styles.visible
        }`}
        ref={imageA}
      />
      <div className={`${styles.sliderImage} ${mod(imageIndex, 2) ? styles.visible : styles.hidden}`} ref={imageB} />
      <div
        className={styles.paddleLeft}
        onClick={(_) => {
          if (transitionBusy) return
          setUserInControl(true)
          setImageIndex(imageIndex - 1)
        }}
      >
        <MdChevronLeft />
      </div>
      <div
        className={styles.paddleRight}
        onClick={(_) => {
          if (transitionBusy) return
          setUserInControl(true)
          setImageIndex(imageIndex + 1)
        }}
      >
        <MdChevronRight />
      </div>
      <div className={`${styles.renderCredit} ${imageIndex === null ? styles.hidden : styles.visible}`}>
        by{' '}
        {render.link ? (
          <a href={render.link} rel="noopener">
            {render.credit}
          </a>
        ) : (
          render.credit
        )}
      </div>
      <img src="/Logo 256.png" className={styles.logo} />
      <h1>Poly Haven</h1>
      <p>{t('tagline')}</p>
    </div>
  )
}

export default Slider
