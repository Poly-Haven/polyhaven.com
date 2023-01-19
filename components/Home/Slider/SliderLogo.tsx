import { useTranslation } from 'next-i18next'
import { useState, useRef, useEffect } from 'react'
import useDivSize from 'hooks/useDivSize'

import styles from './Slider.module.scss'

const SliderLogo = ({ containerWidth, containerHeight }) => {
  const { t } = useTranslation('common')
  const wrapperRef = useRef(null)
  const { width, height } = useDivSize(wrapperRef)

  const [posX, setPosX] = useState(16)
  const [posY, setPosY] = useState(27)
  const [velX, setVelX] = useState(4)
  const [velY, setVelY] = useState(4)
  const [bounceX, setBounceX] = useState(false)
  const [bounceY, setBounceY] = useState(false)
  const [tick, setTick] = useState(0)

  // Tick
  useEffect(() => {
    setInterval(() => {
      setTick((tick) => tick + 1)
    }, 1000 / 60)
  }, [])

  // Move
  useEffect(() => {
    if (posX + width >= containerWidth || posX <= 0) {
      setBounceX(true)
    } else {
      setPosX((posX) => posX + velX)
    }
    if (posY + height >= containerHeight || posY <= 0) {
      setBounceY(true)
    } else {
      setPosY((posY) => posY + velY)
    }
  }, [tick])

  // Bounce X
  useEffect(() => {
    if (bounceX) {
      setPosX((posX) => Math.min(containerWidth - width, Math.max(0, posX - velX)))
      setVelX((velX) => -velX)
      setBounceX(false)
    }
  }, [bounceX])

  // Bounce Y
  useEffect(() => {
    if (bounceY) {
      setPosY((posY) => Math.min(containerHeight - height, Math.max(0, posY - velY)))
      setVelY((velY) => -velY)
      setBounceY(false)
    }
  }, [bounceY])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'absolute',
        left: posX,
        top: posY,
      }}
    >
      <img src="/Logo 256.png" className={styles.logo} style={{ marginBottom: '-0.35em' }} />
      <h1>Poly Haven</h1>
      <p>{t('tagline')}</p>
    </div>
  )
}

export default SliderLogo
