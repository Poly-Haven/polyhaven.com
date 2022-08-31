import { useState, useEffect } from 'react'

import Link from 'next/link';

import { MdPause, MdPlayArrow, MdClose } from "react-icons/md"

import styles from './NewsCard.module.scss'

const NewsCard = ({ newsKey, topText, img, pausedImg, bottomText, link, isMobile }) => {
  const [pause, setPause] = useState(false)
  const keyPause = `newsPause__${newsKey}`
  const [hide, setHide] = useState(false)
  const keyHide = `newsHide__${newsKey}`

  useEffect(() => {
    const storedPause = JSON.parse(localStorage.getItem(keyPause))
    setPause(storedPause !== null ? storedPause : false)
    const storedHide = JSON.parse(localStorage.getItem(keyHide))
    setHide(storedHide !== null ? storedHide : false)
  }, [newsKey]);

  const togglePause = _ => {
    const v = !pause
    setPause(v)
    localStorage.setItem(keyPause, JSON.stringify(v))
  }

  const hideNews = _ => {
    setHide(true)
    localStorage.setItem(keyHide, JSON.stringify(true))
  }

  if (hide) {
    return null
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topText}>
        <div className={styles.spacer} />
        <img src='/Logo 256.png' />
        {topText}
        <div className={styles.spacer} />
        {pausedImg && !isMobile ?
          pause ?
            <MdPlayArrow className={styles.pause} onClick={togglePause} />
            :
            <MdPause className={styles.pause} onClick={togglePause} />
          : null
        }
        <MdClose className={styles.pause} onClick={hideNews} title="Dismiss this news card" />
      </div>
      <Link href={link}>
        <a className={styles.img} target="_blank">{
          (pause || isMobile) && pausedImg ?
            <img src={
              ['.png', '.jpg'].includes(pausedImg.slice(-4).toLowerCase()) ?
                `${pausedImg}?width=384`
                :
                pausedImg
            } />
            :
            img.endsWith('mp4') ?
              <video
                width="384"
                autoPlay={true}
                controls={false}
                loop={true}
                disablePictureInPicture={true}
                disableRemotePlayback={true}
                muted={true}
              >
                <source src={img}
                  type="video/mp4" />
                Sorry, your browser doesn't support embedded videos.
              </video>
              :
              <img src={['.png', '.jpg'].includes(img.slice(-4).toLowerCase()) ? `${img}?width=384` : img} />}</a>
      </Link>
      <Link href={link}><a className={styles.bottomText}>
        {bottomText}
      </a></Link>
    </div>
  )
}

export default NewsCard
