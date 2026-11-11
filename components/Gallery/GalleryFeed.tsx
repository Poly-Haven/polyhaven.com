import { useTranslation } from 'next-i18next'
import { useEffect, useMemo, useRef } from 'react'
import useSWRInfinite from 'swr/infinite'

import Gallery from 'components/Gallery/Gallery'
import Button from 'components/UI/Button/Button'
import Spinner from 'components/UI/Spinner/Spinner'
import fetcher from 'utils/fetcher'

import styles from './Gallery.module.scss'

const PAGE_SIZE = 48
// Pages that load on their own as you scroll. After that it waits for a click, so the footer can
// still be reached.
const AUTO_PAGES = 3

// /gallery: the most popular renders (built with the page), then every other render, newest
// approval first, a page at a time from api's /gallery/feed.
//
// `next` is the cursor api sent with the first screen; it already skips the newest renders that are
// on it. An old render with a lot of clicks can be on the first screen and turn up again in date
// order, so anything already shown is dropped.
const GalleryFeed = ({ first, next }) => {
  const { t: t_c } = useTranslation('common')
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  const getKey = (index, previous) => {
    const before = index === 0 ? next : previous?.next
    if (before === null || before === undefined) return null
    return `${baseUrl}/gallery/feed?before=${before}&limit=${PAGE_SIZE}`
  }
  const {
    data: pages,
    size,
    setSize,
    error,
  } = useSWRInfinite(getKey, fetcher, {
    initialSize: 0,
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  })

  const renders = useMemo(() => {
    const all = [...(first || [])]
    const seen = new Set(all.map((r) => r.id))
    for (const page of pages || []) {
      for (const r of page?.items || []) {
        if (seen.has(r.id)) continue
        seen.add(r.id)
        all.push(r)
      }
    }
    return all
  }, [first, pages])

  const lastPage = pages && pages.length ? pages[pages.length - 1] : null
  const finished =
    next === null || next === undefined || (lastPage && (lastPage.next === null || lastPage.next === undefined))
  const loading = !error && size > (pages?.length || 0)
  const auto = size < AUTO_PAGES

  // Load the next page while the bottom is still well out of view. Re-observed after every page,
  // because an observer only reports changes and the sentinel may still be in range afterwards.
  const sentinel = useRef(null)
  useEffect(() => {
    if (finished || loading || error || !auto || !sentinel.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setSize(size + 1)
      },
      { rootMargin: '1200px 0px' }
    )
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [finished, loading, error, auto, size, setSize])

  return (
    <>
      <Gallery data={renders} />
      {!finished && (
        <div className={styles.more}>
          {loading ? (
            <Spinner />
          ) : auto && !error ? (
            <div ref={sentinel} className={styles.sentinel} />
          ) : (
            <Button text={t_c('more')} onClick={() => setSize(size + 1)} />
          )}
        </div>
      )}
    </>
  )
}

export default GalleryFeed
