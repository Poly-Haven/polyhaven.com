import { MouseEvent, ReactNode, useEffect, useRef } from 'react'
import { MdClose } from 'react-icons/md'

import Spinner from 'components/UI/Spinner/Spinner'

import styles from './Lightbox.module.scss'

type LightboxProps = {
  isOpen: boolean
  imageSrc?: string
  imageAlt?: string
  onClose: (e?: MouseEvent<HTMLDivElement>) => void
  caption?: ReactNode
  detailsLeft?: ReactNode
  detailsRight?: ReactNode
  showSpinner?: boolean
  ignoreLinkClicks?: boolean
  enableClickTracking?: boolean
  trackingKey?: string
  onTrackClick?: (trackingKey: string) => Promise<void> | void
}

const Lightbox = ({
  isOpen,
  imageSrc,
  imageAlt = '',
  onClose,
  caption,
  detailsLeft,
  detailsRight,
  showSpinner = true,
  ignoreLinkClicks = true,
  enableClickTracking = false,
  trackingKey,
  onTrackClick,
}: LightboxProps) => {
  const trackedKeysRef = useRef<Record<string, boolean>>({})

  useEffect(() => {
    if (!isOpen || !enableClickTracking || !trackingKey || !onTrackClick || trackedKeysRef.current[trackingKey]) {
      return
    }

    trackedKeysRef.current[trackingKey] = true
    onTrackClick(trackingKey)
  }, [isOpen, enableClickTracking, trackingKey, onTrackClick])

  if (!isOpen || !imageSrc) {
    return null
  }

  const hasDetails = caption || detailsLeft || detailsRight

  const handleClose = (e: MouseEvent<HTMLDivElement>) => {
    if (ignoreLinkClicks && e.target instanceof Element && e.target.closest('a')) {
      return
    }

    onClose(e)
  }

  return (
    <div className={styles.lightboxWrapper} onClick={handleClose}>
      <div className={styles.lightbox}>
        <div className={styles.imageWrapper}>
          {showSpinner && <Spinner className={styles.spinner} />}
          <img className={styles.image} src={imageSrc} alt={imageAlt} />
        </div>
        {hasDetails && (
          <div className={styles.details}>
            {caption && <em className={styles.caption}>{caption}</em>}
            {detailsLeft}
            <div className={styles.spacer} />
            {detailsRight && <div className={styles.detailsRight}>{detailsRight}</div>}
          </div>
        )}
      </div>
      <MdClose className={styles.closeButton} />
    </div>
  )
}

Lightbox.defaultProps = {
  imageSrc: '',
  imageAlt: '',
  caption: null,
  detailsLeft: null,
  detailsRight: null,
  showSpinner: true,
  ignoreLinkClicks: true,
  enableClickTracking: false,
  trackingKey: undefined,
  onTrackClick: undefined,
}

export default Lightbox
