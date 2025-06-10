import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Loader from 'components/UI/Loader/Loader'

import { IoMdUnlock } from 'react-icons/io'
import { MdArrowForward } from 'react-icons/md'

import styles from './Vaults.module.scss'

const VaultBanner = ({ vault, numPatrons, libraryPage }) => {
  const { t } = useTranslation('common')
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const [videoOffset, setVideoOffset] = useState([0, 0])
  const [blurAmount, setBlurAmount] = useState(0)

  useEffect(() => {
    if (!vault.video) return

    const video = videoRef.current
    const container = containerRef.current
    if (!video || !container) return

    const updateVideoOffset = () => {
      if (video && container) {
        setVideoOffset([
          (container.offsetWidth - video.offsetWidth) / 2,
          (container.offsetHeight - video.offsetHeight) / 2,
        ])
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
        const playbackRate = Math.max(0.1, Math.min(1, visibilityPercentage * 1.5))
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

    // Initial call on page load
    updateVideoOffset()
    handleScroll()

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
      {vault.video && (
        <div className={styles.video}>
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="auto"
            controls={false}
            style={{
              left: `${videoOffset[0]}px`,
              top: `${videoOffset[1]}px`,
              position: 'relative',
              filter: `blur(${blurAmount}px)`,
            }}
            poster={`https://cdn.polyhaven.com/vaults/${vault.id}.png?width=1920&sharpen=true`}
          >
            <source src={vault.video} type="video/mp4" />
          </video>
        </div>
      )}
      <div
        ref={containerRef}
        className={styles.vault}
        style={
          vault.video
            ? {}
            : {
                backgroundImage: `url("https://cdn.polyhaven.com/vaults/${vault.id}.png?width=1920&sharpen=true")`,
              }
        }
      >
        <div className={styles.gradientL} />
        <div className={styles.gradientR} />
        <div className={styles.left}>
          <h2>{vault.name}</h2>
          <p>{vault.description}</p>
          {!libraryPage && vault.about && <Button text={t('common:about-project')} href={vault.about} />}
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            {libraryPage && vault.about && <Button text={t('common:about-project')} href={vault.about} />}
            {!libraryPage && (
              <Button
                text={`${t('common:browse-n', { number: vault.assets.length })} ${t(vault.type) || t('common:Assets')}`}
                href={`/vaults/${vault.id}`}
              />
            )}
            <Button
              text={t('common:access-now')}
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
                  <div className={styles.barText}>
                    {t('common:n-patrons-to-go', { number: Math.max(0, vault.target - numPatrons) })}
                  </div>
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
