import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Loader from 'components/UI/Loader/Loader'

import { IoMdUnlock } from 'react-icons/io'
import { MdArrowForward } from 'react-icons/md'

import styles from './Vaults.module.scss'

const VaultBanner = ({ vault, numPatrons, libraryPage }) => {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [videoOffset, setVideoOffset] = useState(0)
  const [blurAmount, setBlurAmount] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const updateVideoOffset = () => {
      if (video && container) {
        const containerWidth = container.offsetWidth
        const offset = (containerWidth - video.offsetWidth) / 2
        setVideoOffset(offset)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play()
        } else {
          video.pause()
        }
      },
      { threshold: 0 }
    )

    const handleScroll = () => {
      if (video && container) {
        const rect = container.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const visibleHeight = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0))
        const visibilityPercentage = visibleHeight / rect.height

        // Set playback rate based on visibility percentage
        const playbackRate = Math.max(0, Math.min(1, visibilityPercentage * 1.5))
        video.playbackRate = playbackRate

        // Set blur amount inversely proportional to playback rate
        const maxBlur = 33 // Maximum blur amount in pixels
        const blur = Math.max(0, maxBlur - playbackRate * 2 * maxBlur)
        setBlurAmount(blur)
      }
    }

    observer.observe(container)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', updateVideoOffset)
    video.addEventListener('loadedmetadata', updateVideoOffset)

    updateVideoOffset() // Initial call to set the video offset

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', updateVideoOffset)
      video.removeEventListener('loadedmetadata', updateVideoOffset)
    }
  }, [])

  const progressBarPosition = Math.min(1, numPatrons / vault.target)
  return (
    <div className={styles.vaultWrapper}>
      <div className={styles.video}>
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          style={{
            left: `${videoOffset}px`,
            position: 'relative',
            filter: `blur(${blurAmount}px)`,
          }}
          poster={`https://cdn.polyhaven.com/vaults/${vault.id}.png?width=1920&sharpen=true`}
        >
          <source src={`https://u.polyhaven.org/npu/fabric_1080p.mp4`} type="video/mp4" />
        </video>
      </div>
      <div ref={containerRef} className={styles.vault}>
        <div className={styles.gradientL} />
        <div className={styles.gradientR} />
        <div className={styles.left}>
          <h2>{vault.name}</h2>
          <p>{vault.description}</p>
          {!libraryPage && vault.about && <Button text="About the Project" href={vault.about} />}
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            {libraryPage && vault.about && <Button text="About the Project" href={vault.about} />}
            {!libraryPage && (
              <Button text={`Browse ${vault.assets.length} ${vault.type || 'Assets'}`} href={`/vaults/${vault.id}`} />
            )}
            <Button
              text="Access Now"
              href="https://www.patreon.com/checkout/polyhaven"
              icon={<IoMdUnlock />}
              color="red"
            />
          </div>

          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
                {numPatrons > 0 ? (
                  <div className={styles.barText}>{Math.max(0, vault.target - numPatrons)} patrons to go!</div>
                ) : (
                  <div className={styles.barText}>
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {!libraryPage && (
        <div className={styles.assetList}>
          {vault.assets.map((slug) => (
            <Link href="/a/[id]" as={`/a/${slug}`} className={styles.asset} key={slug}>
              <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=192&height=90 `} />
            </Link>
          ))}
          <Link href={`/vaults/${vault.id}`} className={styles.arrow}>
            <MdArrowForward />
          </Link>
        </div>
      )}
    </div>
  )
}

VaultBanner.defaultProps = {
  libraryPage: false,
}

export default VaultBanner
