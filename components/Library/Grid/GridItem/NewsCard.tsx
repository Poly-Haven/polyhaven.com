import { useState, useEffect, useRef } from 'react'

import Link from 'next/link'

import { MdPause, MdPlayArrow, MdClose } from 'react-icons/md'

import styles from './NewsCard.module.scss'

const NewsCard = ({ newsKey, topText, img, pausedImg, bottomText, link, isMobile, important, flags }) => {
  const [pause, setPause] = useState(false)
  const keyPause = `newsPause__${newsKey}`
  const [hide, setHide] = useState(false)
  const keyHide = `newsHide__${newsKey}`
  const explosionVideoRef = useRef(null)

  useEffect(() => {
    const storedPause = JSON.parse(localStorage.getItem(keyPause))
    setPause(storedPause !== null ? storedPause : false)
    const storedHide = JSON.parse(localStorage.getItem(keyHide))
    setHide(storedHide !== null ? storedHide : false)
  }, [newsKey])

  const togglePause = (_) => {
    const v = !pause
    setPause(v)
    localStorage.setItem(keyPause, JSON.stringify(v))
  }

  const hideNews = (_) => {
    setHide(true)
    localStorage.setItem(keyHide, JSON.stringify(true))
  }

  let flagImg = null
  const now = new Date().toISOString()
  for (const flag of flags || []) {
    if (flag.from <= now && flag.to >= now) {
      flagImg = flag.img
      break
    }
  }

  // Trigger explosion when flag animation completes (after 2.5s)
  useEffect(() => {
    if (flagImg && explosionVideoRef.current) {
      const timer = setTimeout(async () => {
        const video = explosionVideoRef.current
        if (video) {
          try {
            video.currentTime = 0 // Reset to beginning
            video.style.opacity = '1' // Make visible
            await video.play()
          } catch (error) {
            console.error('Failed to play explosion video:', error)
          }
        }
      }, 2500) // Match the flagSpawn animation duration

      return () => clearTimeout(timer)
    }
  }, [flagImg, pause])

  if (hide && !important) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topText}>
        <div className={styles.spacer} />
        <img src="/Logo 256.png" />
        {topText}
        <div className={styles.spacer} />
        {pausedImg && !isMobile ? (
          pause ? (
            <MdPlayArrow className={styles.pause} onClick={togglePause} />
          ) : (
            <MdPause className={styles.pause} onClick={togglePause} />
          )
        ) : null}
        {!important && <MdClose className={styles.pause} onClick={hideNews} title="Dismiss this news card" />}
      </div>
      <Link href={link} className={styles.img} target="_blank">
        {(pause || isMobile) && pausedImg ? (
          <img
            src={
              ['.png', '.jpg'].includes(pausedImg.slice(-4).toLowerCase())
                ? `${pausedImg}?width=384&quality=95`
                : pausedImg
            }
          />
        ) : img.endsWith('mp4') ? (
          <video
            width="384"
            autoPlay={true}
            controls={false}
            loop={true}
            disablePictureInPicture={true}
            disableRemotePlayback={true}
            muted={true}
          >
            <source src={img} type="video/mp4" />
            Sorry, your browser doesn't support embedded videos.
          </video>
        ) : (
          <img src={['.png', '.jpg'].includes(img.slice(-4).toLowerCase()) ? `${img}?width=384&quality=95` : img} />
        )}
        {flagImg && <img src={flagImg} className={`${styles.flag} ${!pause && !isMobile ? styles.flagAnim : ''}`} />}
        {flagImg && !pause && !isMobile && (
          <video
            ref={explosionVideoRef}
            width="400"
            autoPlay={false}
            loop={false}
            disablePictureInPicture={true}
            disableRemotePlayback={true}
            muted={true}
            className={styles.explosion}
            style={{ opacity: 0, pointerEvents: 'none' }}
            onEnded={() => {
              // Hide the video when it finishes playing
              if (explosionVideoRef.current) {
                explosionVideoRef.current.style.opacity = '0'
              }
            }}
          >
            <source src={'https://u.polyhaven.org/HIm/explosion.webm'} type="video/webm" />
          </video>
        )}
      </Link>
      <Link href={link} className={styles.bottomText}>
        {bottomText}
      </Link>
    </div>
  )
}

export default NewsCard
