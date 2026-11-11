import { useTranslation } from 'next-i18next'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { isURL } from 'validator'
import { MdHelp } from 'react-icons/md'

import useDivSize from 'hooks/useDivSize'
import useQuery from 'hooks/useQuery'
import Lightbox from 'components/Lightbox/Lightbox'

import { assetImg, cdnUrl } from 'utils/cdn'
import { layoutMosaic, extendMosaic, targetBandHeight, Mosaic } from 'utils/galleryLayout'

import styles from './Gallery.module.scss'
import { titleCase } from 'utils/stringUtils'
import { isAiUseLevel } from 'utils/aiDisclosure'

const URL_VALIDATION_OPTIONS = {
  require_protocol: true,
  allow_underscores: true,
}

// Width the layout is computed for before the container has been measured, which is also what the
// server renders. Positions are percentages, so it scales to the real width until that's known.
const DEFAULT_WIDTH = 1280

// Renders submitted before sizes were stored, if any are left, are drawn 16:9 and cropped to fit.
const aspectOf = (d) => (d.width && d.height ? d.width / d.height : 16 / 9)

// Two widths per image keeps Cloudflare's hit rate up. Without `format`, Bunny picks one from the
// Accept header and Cloudflare caches whichever variant it fetched first.
// No version: gallery file_names are random per upload, so a replacement is a new filename and there
// is nothing to bust. Encoded because older file_names contain spaces (and could contain commas),
// which would split a srcset entry; browsers send a space as %20 anyway, so the URL is unchanged.
const thumbUrl = (fileName: string, width: number) =>
  cdnUrl(`gallery/${encodeURIComponent(fileName)}`, { width, quality: 95, format: 'webp' })

// A layout keeps being reused while the container stays within 15% of the width it was computed
// for, and in the same size class: it is drawn in percentages, so it just scales. Re-laying out on
// every pixel of a resize would reshuffle the whole gallery.
const sizeClass = (w: number) => (w < 600 ? 0 : w < 1000 ? 1 : 2)
const closeEnough = (a: number, b: number) => sizeClass(a) === sizeClass(b) && Math.abs(a - b) / b < 0.15

const useMosaic = (data, measuredWidth: number): Mosaic => {
  const cache = useRef<{ ids: string[]; mosaic: Mosaic } | null>(null)
  return useMemo(() => {
    const ids = data.map((d) => d.id)
    const prev = cache.current
    const width = prev && closeEnough(prev.mosaic.width, measuredWidth) ? prev.mosaic.width : measuredWidth
    let mosaic: Mosaic
    const samePrefix = prev && prev.mosaic.width === width && prev.ids.every((id, k) => ids[k] === id)
    if (samePrefix && prev.ids.length === ids.length) {
      mosaic = prev.mosaic
    } else if (samePrefix && prev.ids.length < ids.length) {
      // More renders were appended (infinite scroll): everything already on screen stays put.
      mosaic = extendMosaic(prev.mosaic, data.map(aspectOf))
    } else {
      mosaic = layoutMosaic(data.map(aspectOf), width)
    }
    cache.current = { ids, mosaic }
    return mosaic
  }, [data, measuredWidth])
}

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(4)}%`

const Gallery = ({ data, assetPage }) => {
  const { t } = useTranslation('gallery')
  const { t: t_c } = useTranslation('common')
  const [didInitFromQuery, setDidInitFromQuery] = useState(false)
  const [lightboxData, setLightboxData] = useState(null)
  const widthRef = useRef(null)
  const { width } = useDivSize(widthRef)
  const query = useQuery()
  const router = useRouter()

  const renders = useMemo(() => data || [], [data])
  const mosaic = useMosaic(renders, width || DEFAULT_WIDTH)

  useEffect(() => {
    if (query && query.render && !didInitFromQuery) {
      // We only want to do this the first time the page loads
      setDidInitFromQuery(true)
      const loaded = renders.find((r) => r.id === query.render)
      if (loaded) {
        setLightboxData(loaded)
        return
      }
      // Linked to a render that isn't on the first screen (an older one, from Discord or a share).
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
      fetch(`${baseUrl}/gallery/render/${encodeURIComponent(String(query.render))}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((r) => r && setLightboxData(r))
        .catch(() => {})
    }
  }, [query, didInitFromQuery, renders])

  const viewImage = async (e) => {
    const imageData = renders[Number(e.currentTarget.dataset.index)]
    setLightboxData(imageData)

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, render: imageData.id },
      },
      undefined,
      { shallow: true, scroll: false }
    )
  }

  const trackImageClick = async (id) => {
    await fetch(`/api/galleryClick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((resdata) => {
        console.log('Tracked click:', resdata)
      })
  }

  const closeLightbox = (e) => {
    if (e.target.tagName.toLowerCase() !== 'a') {
      // Ignore clicks on links
      setLightboxData(null)

      router.push(
        {
          pathname: router.pathname,
          query: assetPage ? { id: router.query.id } : {},
        },
        undefined,
        { shallow: true, scroll: false }
      )
    }
  }

  const W = mosaic.width
  const totalH = mosaic.height || 1
  // Tiles are sized in the layout's own pixels; `sizes` lets the browser pick 480 or 960 for its
  // actual width and pixel density. A sparse page can grow past the usual band height.
  const scale = (width || DEFAULT_WIDTH) / W
  const maxTileHeight = targetBandHeight(W) * 2

  return (
    <div className={styles.wrapper} ref={widthRef}>
      <div className={styles.mosaic} style={{ paddingBottom: pct(mosaic.height, W) }}>
        {mosaic.bands.flatMap((band) =>
          band.rects.map((r) => {
            const d = renders[r.i]
            const name = d.artwork_name || d.name || ''
            return (
              <div
                key={d.id}
                className={styles.tile}
                style={{ left: pct(r.x, W), top: pct(r.y, totalH), width: pct(r.w, W), height: pct(r.h, totalH) }}
                data-index={r.i}
                onClick={viewImage}
              >
                <img
                  src={thumbUrl(d.file_name, 480)}
                  srcSet={`${thumbUrl(d.file_name, 480)} 480w, ${thumbUrl(d.file_name, 960)} 960w`}
                  sizes={`${Math.ceil(r.w * scale)}px`}
                  width={d.width || undefined}
                  height={d.height || undefined}
                  loading={r.y < maxTileHeight ? 'eager' : 'lazy'}
                  decoding="async"
                  alt={name}
                  // A feed page cached before a render was deleted still lists it.
                  onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
                />
              </div>
            )
          })
        )}
      </div>
      {lightboxData && (
        <Lightbox
          isOpen={!!lightboxData}
          imageSrc={`https://cdn.polyhaven.com/gallery/${lightboxData.file_name}?width=${width}&quality=95`}
          imageAlt={lightboxData.name || ''}
          onClose={closeLightbox}
          caption={lightboxData.artwork_name || null}
          detailsLeft={
            <>
              <span style={{ opacity: 0.5 }}>{t('by')}</span>
              {lightboxData.author_link && isURL(lightboxData.author_link, URL_VALIDATION_OPTIONS) ? (
                <a target="_blank" rel="noopener" href={lightboxData.author_link}>
                  {lightboxData.author}
                </a>
              ) : (
                <span>{lightboxData.author}</span>
              )}
              {isAiUseLevel(lightboxData.ai_use) && lightboxData.ai_use !== 'none' ? (
                <span className={styles.aiUse}>
                  {t_c('gen-ai.title')}: {t_c(`gen-ai.${lightboxData.ai_use}`)}
                  {lightboxData.ai_note ? (
                    <>
                      {' '}
                      <MdHelp data-tip={lightboxData.ai_note} />
                    </>
                  ) : null}
                </span>
              ) : null}
            </>
          }
          detailsRight={
            <>
              <p>Assets used:</p>
              {lightboxData.assets_used.map((a, key) => (
                <Link key={key} href={`/a/${a}`}>
                  <img src={assetImg.thumb(a, { height: 50, width: 200 })} alt={titleCase(a.replace(/_/g, ' '))} />
                </Link>
              ))}
            </>
          }
          enableClickTracking
          trackingKey={String(lightboxData.id || '')}
          onTrackClick={trackImageClick}
          ignoreLinkClicks
        />
      )}
    </div>
  )
}

Gallery.defaultProps = {
  assetPage: false,
}

export default Gallery
