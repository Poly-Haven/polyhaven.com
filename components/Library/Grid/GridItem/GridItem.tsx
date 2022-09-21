import { useTranslation } from 'next-i18next';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link'
import { timeago } from 'utils/dateUtils';

import { MdCollections } from 'react-icons/md';

import { daysOld } from 'utils/dateUtils'
import IconPatreon from 'components/UI/Icons/Patreon'
import SimpleAuthorCredit from 'components/Library/Grid/SimpleAuthorCredit';
import Loader from 'components/UI/Loader/Loader';

import styles from './GridItem.module.scss';

const mod = (a, b) => {
  // Replacement for % that supports negative numbers.
  return ((a % b) + b) % b;
}

const GridItem = ({ asset, assetID, onClick, blurUpcoming, enableTurnaround, preloadTurnaround }) => {
  const { t: tt } = useTranslation('time');
  const { t } = useTranslation('library');
  const [turnaround, setTurnaround] = useState(false)
  const [offsetStart, setOffsetStart] = useState(0)
  const [imageLoading, setImageLoading] = useState(false)
  const [hasTurned, setHasTurned] = useState(false)

  const imgRef = useRef(null)
  const turnaroundWrapperRef = useRef(null)
  const turnaroundRef = useRef(null)
  const wrapperRef = useRef(null)

  let size = [371, 278];
  if (asset.type === 1) {
    size = [285, 285]
  } else if (asset.type === 2) {
    size = [450, 300]
  }

  useEffect(() => {
    if (enableTurnaround && preloadTurnaround) {
      const img = new Image();
      img.src = `https://cdn.polyhaven.com/asset_img/turnarounds/${assetID}.png?width=7680height=${size[1]}`
    }
  }, [])

  const blur = blurUpcoming && daysOld(asset.date_published) < 0

  let badge;
  if (daysOld(asset.date_published) < 0) {
    badge = {
      text: <><IconPatreon />{t('early-access')}</>,
      style: styles.soon,
      tooltip: t("$3+ Patrons can log in to download early")
    }
  } else if (daysOld(asset.date_published) < 7) {
    badge = {
      text: t('new'),
      style: styles.new
    }
  }

  let indicators = []
  if (asset.backplates) {
    indicators.push({
      text: `✔ Backplates: ${t('backplates')}`,
      icon: <MdCollections />,
    })
  }

  const createTurnaround = (e) => {
    setTurnaround(true)
    setHasTurned(false)
    setOffsetStart(e.pageX)
    const turnaroundSrc = `https://cdn.polyhaven.com/asset_img/turnarounds/${assetID}.png?width=7680height=${size[1]}`
    if (turnaroundRef.current.src !== turnaroundSrc) {
      setImageLoading(true)
    }
    turnaroundRef.current.src = turnaroundSrc
    turnaroundWrapperRef.current.style.width = imgRef.current.offsetWidth + 'px'
    turnaroundWrapperRef.current.style.height = imgRef.current.offsetHeight + 'px'
    turnaroundWrapperRef.current.style.left = `${imgRef.current.getBoundingClientRect().left - wrapperRef.current.getBoundingClientRect().left}px`
    turnaroundWrapperRef.current.style.top = `${imgRef.current.getBoundingClientRect().top - wrapperRef.current.getBoundingClientRect().top}px`
    turnaroundRef.current.style.width = (imgRef.current.offsetWidth * 15) + 'px'; // Force correct width, sometimes there are rounding errors
  }
  const destroyTurnaround = (e) => {
    setTurnaround(false)
    if (imgRef.current.style.opacity == 0 && hasTurned) {
      imgRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150 })
    }
    imgRef.current.style.opacity = 1
    if (turnaroundRef.current.style.opacity == 1 && hasTurned) {
      turnaroundRef.current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250 })
    }
    turnaroundRef.current.style.opacity = 0
  }
  const updateTurnaround = (e) => {
    if (turnaround) {
      const relative = (e.pageX - offsetStart) / -wrapperRef.current.offsetWidth + (1 / 15 / 4)
      let step = Math.round(mod(relative, 1) * 14)
      step = step * imgRef.current.offsetWidth
      const rotate = `-${step}px`
      turnaroundRef.current.style.left = rotate
      if (!imageLoading && step !== 0) {
        setHasTurned(true)
      }
      if (!imageLoading && !hasTurned) {
        if (step === 0) {
          imgRef.current.style.opacity = 1
          turnaroundRef.current.style.opacity = 0
        } else {
          turnaroundRef.current.style.opacity = 1
          imgRef.current.style.opacity = 0
        }
      }
    }
    if (imageLoading) {
      setOffsetStart(e.pageX)
    }
  }
  const imageLoaded = (e) => {
    setImageLoading(false)
    if (turnaround && hasTurned) {
      turnaroundRef.current.style.opacity = 1
      imgRef.current.style.opacity = 0
    }
  }

  const img_src = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=${size[0]}&height=${size[1]}`
  return (
    <Link href="/a/[id]" as={`/a/${assetID}`}><a
      className={`${styles.gridItem} ${blur ? styles.blur : ''}`}
      onClick={onClick}
      onMouseEnter={asset.type === 2 && enableTurnaround ? createTurnaround : null}
      onMouseMove={asset.type === 2 && enableTurnaround ? updateTurnaround : null}
      onMouseLeave={asset.type === 2 && enableTurnaround ? destroyTurnaround : null}
      ref={wrapperRef}
    >
      <div className={styles.author}>
        <div className={styles.authorInner}>
          {Object.keys(asset.authors).sort().map(a => <SimpleAuthorCredit key={a} id={a} donated={asset.donated} />)}
        </div>
      </div>
      <div className={styles.thumb}><img
        src={img_src}
        alt={asset.name}
        ref={imgRef}
      /></div>
      {asset.type === 2 && enableTurnaround ?
        <div className={styles.turnaround} ref={turnaroundWrapperRef}><img
          src={""}
          alt={" "} // Empty alt text to prevent glitches when loading
          onLoad={imageLoaded}
          ref={turnaroundRef}
        /></div>
        : null}
      <div className={styles.text}>
        <h3>{asset.name}</h3>
        <p>{timeago(asset.date_published * 1000, tt)}</p>
      </div>
      {badge ? <div className={`${styles.badge} ${badge.style}`} title={badge.tooltip}>{badge.text}</div> : null}
      <div className={styles.indicators}>{indicators.map(i => <div key={i.text} title={i.text} className={styles.indicator}>{i.icon}</div>)}{imageLoading ? <Loader /> : null}</div>
    </a></Link>
  );
}

GridItem.defaultProps = {
  onClick: null,
  blurUpcoming: true,
  enableTurnaround: true,
  preloadTurnaround: false,
}

export default GridItem;