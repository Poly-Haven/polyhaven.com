import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { MdChevronRight, MdClose } from 'react-icons/md'

import { ancestorsOf, categoryLabel, nodeFromPath } from 'utils/taxonomy'

import styles from './Grid.module.scss'

/**
 * The library heading, as functional breadcrumbs: asset type › category › sub-category, plus a
 * removable crumb for the author filter. Every crumb is a link, so it doubles as navigation back up
 * the tree. Category links carry the current query and route shallowly, matching the sidebar, so
 * moving up doesn't drop the active filters or refetch anything.
 *
 * Collection and vault pages have their own headers above the grid, so they only get breadcrumbs
 * when there's something extra to show (an author filter).
 */
const Breadcrumbs = ({ assetType, assetTypeLabel, categoryPath, author, setAuthor, collection, vault, tcat, t }) => {
  const router = useRouter()

  // Preserved so moving up the tree keeps the active filters and search.
  const query = useMemo(() => {
    const carried = { ...router.query }
    for (const key of ['assets', 'collection', 'vault']) delete carried[key]
    return carried
  }, [router.query])

  const node = categoryPath ? nodeFromPath(assetType, categoryPath) : null
  const trail = node ? [...ancestorsOf(assetType, node), node] : []

  const onCollectionOrVault = Boolean(collection || vault)
  if (onCollectionOrVault && !author) return null

  const crumbs: { key: string; label: string; href?: any; shallow?: boolean }[] = []

  if (collection) {
    crumbs.push({ key: 'collection', label: collection.name, href: `/collections/${collection.id}` })
  } else if (vault) {
    crumbs.push({ key: 'vault', label: vault.name, href: `/vaults/${vault.id}` })
  } else {
    crumbs.push({ key: 'type', label: assetTypeLabel, href: { pathname: `/${assetType}`, query }, shallow: true })
    for (const n of trail) {
      crumbs.push({
        key: n.path,
        label: categoryLabel(tcat, n),
        href: { pathname: `/${assetType}/${n.slugPath}`, query },
        shallow: true,
      })
    }
  }

  // Keep the old font-size step-down for long trails so the header still fits.
  const totalLength = crumbs.reduce((n, c) => n + c.label.length, 0) + (author ? author.length : 0)
  const sizeClass = styles['s' + Math.floor(totalLength / 17.5)] || ''

  return (
    <div className={`${styles.breadcrumbs} ${sizeClass}`}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1 && !author
        return (
          <span className={styles.crumbWrap} key={crumb.key}>
            {i > 0 ? <MdChevronRight className={styles.crumbSep} /> : null}
            <Link
              href={crumb.href}
              shallow={crumb.shallow}
              className={`${styles.crumb} ${isLast ? styles.crumbCurrent : ''}`}
            >
              {crumb.label}
            </Link>
          </span>
        )
      })}
      {author ? (
        <span className={styles.crumbWrap}>
          <MdChevronRight className={styles.crumbSep} />
          <span className={`${styles.crumb} ${styles.crumbCurrent} ${styles.crumbAuthor}`}>
            {t('library:by-author', { author })}
            <MdClose
              className={styles.crumbClear}
              onClick={() => setAuthor(undefined)}
              data-tip={t('library:Clear author')}
            />
          </span>
        </span>
      ) : null}
    </div>
  )
}

export default Breadcrumbs
