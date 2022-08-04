import { useState, useEffect } from 'react'

import Link from 'next/link';

import { MdPause, MdPlayArrow } from "react-icons/md"

import styles from './NewsCard.module.scss'

const NewsCard = ({ newsKey, topText, img, pausedImg, bottomText, link }) => {
  const [pause, setPause] = useState(false)
  const storageKey = `newsPause__${newsKey}`

  useEffect(() => {
    const storedValue = JSON.parse(localStorage.getItem(storageKey))
    const v = storedValue !== null ? storedValue : false
    setPause(v)
  }, []);

  const togglePause = _ => {
    const v = !pause
    setPause(v)
    localStorage.setItem(storageKey, JSON.stringify(v))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.topText}>
        <div className={styles.spacer} />
        <img src='/Logo 256.png' />
        {topText}
        <div className={styles.spacer} />
        {pausedImg ?
          pause ?
            <MdPlayArrow className={styles.pause} onClick={togglePause} />
            :
            <MdPause className={styles.pause} onClick={togglePause} />
          : null
        }
      </div>
      <Link href={link}>
        <a className={styles.img}><img src={pause ? pausedImg : img} /></a>
      </Link>
      <Link href={link}><a className={styles.bottomText}>
        {bottomText}
      </a></Link>
    </div>
  )
}

export default NewsCard
