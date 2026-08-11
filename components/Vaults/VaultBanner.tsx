import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useUserPatron } from 'contexts/UserPatronContext'

import Button from 'components/UI/Button/Button'
import Loader from 'components/UI/Loader/Loader'
import { isUnlockedVault } from 'utils/vaults'

import { IoMdUnlock } from 'react-icons/io'
import { MdArrowForward } from 'react-icons/md'

import styles from './Vaults.module.scss'

const MAX_BLUR = 33 // px
// Below this much of the banner on screen the video pauses and blurs instead of playing slowly.
// It is the point the old maths already faded blur out at, so the look is unchanged.
const PLAY_AT = 1 / 3
// 2% steps. Fine enough for a smooth ramp, and IntersectionObserver reports them off the scroll
// path - unlike the getBoundingClientRect() call this replaces, which forced a layout per banner
// on every scroll event.
const THRESHOLDS = Array.from({ length: 51 }, (_, i) => i / 50)

const poster = (id: string) => `https://cdn.polyhaven.com/vaults/${id}.png?width=1920&quality=80&sharpen=true`

const VaultBanner = ({ vault, numPatrons, libraryPage }) => {
  const { t } = useTranslation('common')
  // Pinned to the page's locale rather than left to the runtime default: Node resolves that to a
  // different locale than the browser does ("19 June 2025" vs "June 19, 2025"), which is a
  // hydration mismatch. Every other date in this codebase pins its locale for the same reason.
  const { locale } = useRouter()
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const wrapperRef = useRef(null)
  const [videoOffset, setVideoOffset] = useState([0, 0])
  // The <video> is only created once the banner is within a screenful of the viewport, so a page
  // of vaults costs one video element per banner you actually scroll to, not all of them at once.
  const [showVideo, setShowVideo] = useState(false)
  const { earlyAccess } = useUserPatron()

  // Observes the wrapper, not the banner inside it: the wrapper carries content-visibility, and
  // anything within a skipped subtree reports as non-intersecting, so an observer on the inner
  // element would never fire until the browser had already decided to render it.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!vault.video || !wrapper) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowVideo(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100% 0px' }
    )
    observer.observe(wrapper)
    return () => observer.disconnect()
  }, [vault.video])

  useEffect(() => {
    const container = containerRef.current
    if (!showVideo || !container) return
    const video = videoRef.current
    if (!video) return

    const updateVideoOffset = () => {
      setVideoOffset([
        (container.offsetWidth - video.offsetWidth) / 2,
        (container.offsetHeight - video.offsetHeight) / 2,
      ])
    }

    // Writes straight to the DOM node on purpose. Routing this through React state re-rendered the
    // whole banner on every scroll event - and the banner contains one <Link><img> per asset, up
    // to 70 of them.
    const apply = (ratio: number) => {
      const rate = Math.max(0.1, Math.min(1, ratio * 1.5))
      if (ratio < PLAY_AT) {
        // Blur is only ever applied to a *paused* video. Blurring a playing one makes the
        // compositor re-run a 33px blur over a 1080p surface every single frame, which was the
        // bulk of the cost while scrolling.
        if (!video.paused) video.pause()
        video.style.filter = `blur(${Math.max(0, MAX_BLUR - rate * 2 * MAX_BLUR)}px)`
      } else {
        video.style.filter = ''
        video.playbackRate = rate
        if (video.paused) video.play().catch(() => {})
      }
    }

    const observer = new IntersectionObserver(([entry]) => apply(entry.intersectionRatio), {
      threshold: THRESHOLDS,
    })
    observer.observe(container)
    window.addEventListener('resize', updateVideoOffset)
    video.addEventListener('loadedmetadata', updateVideoOffset)
    updateVideoOffset()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateVideoOffset)
      video.removeEventListener('loadedmetadata', updateVideoOffset)
    }
  }, [showVideo])

  // A released vault keeps its banner as an archive entry, but everything that sells access to it
  // goes: the goal is met, and the assets behind it are already free.
  const released = isUnlockedVault(vault)
  const progressBarPosition = Math.min(1, numPatrons / vault.target)

  // Built once per vault. It is by far the largest subtree here - one entry per asset - and it
  // depends on nothing that changes, so it must not be rebuilt when the banner re-renders for a
  // patron count or a resize.
  const assetStrip = useMemo(
    () =>
      // Not rendered on a library page, so don't build it there either.
      (libraryPage ? [] : vault.assets || []).map((slug) => (
        <Link href="/a/[id]" as={`/a/${slug}`} className={styles.asset} key={slug}>
          {/* The archive puts several hundred of these on one page, so they load on approach. */}
          <img
            loading="lazy"
            decoding="async"
            src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=192&height=90&quality=95&sharpen=true`}
          />
        </Link>
      )),
    [vault.assets, libraryPage]
  )
  return (
    <div className={styles.vaultWrapper} ref={wrapperRef}>
      {vault.video && showVideo && (
        <div className={styles.video}>
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            // Metadata only: enough to size the element, while the ~10MB of video itself is not
            // fetched until the banner is actually on screen and apply() calls play().
            preload="metadata"
            controls={false}
            style={{
              left: `${videoOffset[0]}px`,
              top: `${videoOffset[1]}px`,
              position: 'relative',
              objectPosition: vault.video_position || 'center',
            }}
            poster={poster(vault.id)}
          >
            <source src={vault.video} type="video/mp4" />
          </video>
        </div>
      )}
      <div
        ref={containerRef}
        className={styles.vault}
        // The poster also stands in for a video that has not mounted yet. The swap happens a
        // screenful before the banner is visible, so it is never seen.
        style={vault.video && showVideo ? {} : { backgroundImage: `url("${poster(vault.id)}")` }}
      >
        {vault.no_gradient ? null : (
          <>
            <div className={styles.gradientL} />
            <div className={styles.gradientR} />
          </>
        )}
        <div className={styles.left}>
          <h2>{vault.name}</h2>
          <p>{vault.description}</p>
          {!libraryPage && vault.about && <Button text={t('common:about-project')} href={vault.about} />}
        </div>

        <div className={styles.right}>
          <div className={styles.row} style={{ justifyContent: 'right' }}>
            {libraryPage && vault.about && <Button text={t('common:about-project')} href={vault.about} />}
            {!libraryPage && (
              <Button
                text={`${t('common:browse-n', { number: vault.assets.length })} ${t(vault.type) || t('common:Assets')}`}
                href={`/vaults/${vault.id}`}
              />
            )}
            {!earlyAccess && !released && (
              <Button
                text={t('common:access-now')}
                href="https://www.patreon.com/polyhaven/join?cadence=12"
                icon={<IoMdUnlock />}
                color="red"
              />
            )}
          </div>

          {released ? (
            <div className={styles.unlockedNote}>
              <IoMdUnlock />
              {vault.unlocked
                ? t('common:unlocked-on', {
                    date: new Date(vault.unlocked).toLocaleDateString(locale || 'en', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }),
                  })
                : t('common:unlocked-free')}
            </div>
          ) : (
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
          )}
        </div>

        {vault.render_credit && (
          <div className={styles.renderCredit}>
            Render by{' '}
            {vault.render_credit.link ? (
              <a href={vault.render_credit.link} rel="noopener" target="_blank">
                {vault.render_credit.name}
              </a>
            ) : (
              vault.render_credit.name
            )}
          </div>
        )}
      </div>

      {!libraryPage && (
        <div className={styles.assetList}>
          {assetStrip}
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
