import { useTranslation } from 'next-i18next'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Masonry from 'react-masonry-css'
import { isURL } from 'validator'
import LazyLoad from 'react-lazy-load'

import useDivSize from 'hooks/useDivSize'
import useQuery from 'hooks/useQuery'

import { MdClose } from 'react-icons/md'

import Spinner from 'components/UI/Spinner/Spinner'

import styles from './Gallery.module.scss'

const Gallery = ({ data, assetPage }) => {
  const { t } = useTranslation('gallery')
  const [clicked, setClicked] = useState({})
  const [lightboxData, setLightboxData] = useState(null)
  const widthRef = useRef(null)
  const { width } = useDivSize(widthRef)
  const query = useQuery()
  const router = useRouter()

  useEffect(() => {
    if (query && query.render) {
      if (Object.keys(clicked).length === 0) {
        // We only want to do this the first time the page loads
        for (const r of data) {
          if (r.id === query.render) {
            setLightboxData(r)
            break
          }
        }
      }
    }
  }, [query])

  const imgWidth = 460

  const numCols = (width) => {
    if (width <= 590) {
      return 1
    }
    return Math.ceil(width / (imgWidth + 8))
  }

  const viewImage = async (e) => {
    const data = JSON.parse(e.currentTarget.dataset.info)
    setLightboxData(data)

    if (!Object.keys(clicked).includes(data.id)) {
      await fetch(`/api/galleryClick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: data.id }),
      })
        .then((res) => res.json())
        .then((resdata) => {
          console.log('Tracked click:', resdata)
        })
    }

    let c = clicked
    c[data.id] = true
    setClicked(c)

    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, render: data.id },
      },
      undefined,
      { shallow: true }
    )
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
        { shallow: true }
      )
    }
  }

  return (
    <div className={styles.wrapper} ref={widthRef}>
      <Masonry breakpointCols={numCols(width)} className={styles.masonry} columnClassName={styles.masonryColumn}>
        {data.map((d, k) => (
          <div key={k} className={styles.thumbnail} data-info={JSON.stringify(d)} onClick={viewImage}>
            <LazyLoad offset={500}>
              <img src={`https://cdn.polyhaven.com/gallery/${d.file_name}?width=${imgWidth}`} alt={d.name} />
            </LazyLoad>
          </div>
        ))}
        {!assetPage && (
          (<Link href="/gallery-submit" prefetch={false}>

            <div className={styles.add}>
              <strong>+</strong>
              <p>{t('submit.title')}</p>
            </div>

          </Link>)
        )}
      </Masonry>
      {lightboxData && (
        <div className={styles.lightboxWrapper} onClick={closeLightbox}>
          <div className={styles.lightbox}>
            <div className={styles.imageWrapper}>
              <Spinner className={styles.spinner} />
              <img src={`https://cdn.polyhaven.com/gallery/${lightboxData.file_name}?width=${width}`} />
            </div>
            <p>
              {lightboxData.artwork_name && <em>{lightboxData.artwork_name}</em>}
              {t('by')}
              {lightboxData.author_link && isURL(lightboxData.author_link, { require_protocol: true }) ? (
                <a target="_blank" rel="noopener" href={lightboxData.author_link}>
                  {lightboxData.author}
                </a>
              ) : (
                <span>{lightboxData.author}</span>
              )}
              {t('using')}
              {lightboxData.assets_used.slice(0, 3).map((a, key) => (
                <Link key={key} href={`/a/${a}`}>
                  {a}
                </Link>
              ))}
              {lightboxData.assets_used.length > 3 ? (
                <span title={lightboxData.assets_used.join(', ')}>...</span>
              ) : null}
            </p>
          </div>
          <MdClose />
        </div>
      )}
    </div>
  );
}

Gallery.defaultProps = {
  assetPage: false,
}

export default Gallery
