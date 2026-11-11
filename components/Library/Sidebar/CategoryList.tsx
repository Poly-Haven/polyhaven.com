import { useMemo } from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { assetTypeName } from 'utils/assetTypeName'
import apiSWR from 'utils/apiSWR'
import { getRoots, categoryLabel, TaxonomyNode } from 'utils/taxonomy'
import { filterAssets, categoryCounts } from 'utils/assetFiltering'

import Spinner from 'components/UI/Spinner/Spinner'
import { MdKeyboardArrowRight } from 'react-icons/md'

import styles from './Sidebar.module.scss'

/**
 * The category tree. Unlike the old tag co-occurrence list, this renders the fixed single-path
 * taxonomy, and counts are INCLUSIVE - a parent shows the total of everything nested inside it,
 * exactly like a Blender catalog.
 *
 * Counts come from the same asset list the grid already loads (SWR dedupes the request), so the
 * numbers always agree with what the grid is showing, and expanding a branch costs no extra fetch.
 *
 * Navigation is shallow: the category lives in the URL path, but the page resolves it from the
 * bundled taxonomy, so switching category re-filters the already-loaded assets instantly instead
 * of making a server round-trip.
 */

/**
 * Where a category entry links to (null = "All ..."). The library's default navigates to the
 * category's own path (/hdris/coast-water/beaches); the HDRI map keeps the category in its query
 * string instead.
 */
export type CategoryHref = (node: TaxonomyNode | null, query: Record<string, any>) => LinkProps['href']

const libraryCategoryHref =
  (assetType: string): CategoryHref =>
  (node, query) => ({ pathname: node ? `/${assetType}/${node.slugPath}` : `/${assetType}`, query })

const CategoryNode = ({
  node,
  activePath,
  counts,
  query,
  depth,
  t,
  hrefFor,
}: {
  node: TaxonomyNode
  activePath: string | null
  counts: Record<string, number>
  query: Record<string, any>
  depth: number
  t: any
  hrefFor: CategoryHref
}) => {
  const count = counts[node.path] || 0
  // Hide empty branches - nothing to browse there.
  if (!count) return null

  const isActive = activePath === node.path
  const isAncestor = Boolean(activePath && activePath.startsWith(node.path + '/'))
  const showChildren = isActive || isAncestor

  return (
    <div>
      <Link
        href={hrefFor(node, query)}
        shallow
        title={node.description || undefined}
        className={`${styles.cat} ${isAncestor ? styles.catSemiActive : ''} ${isActive ? styles.catActive : ''}`}
      >
        {depth === 0 ? (
          <MdKeyboardArrowRight className={styles.caret} />
        ) : (
          <MdKeyboardArrowRight className={styles.smallCaret} />
        )}
        <span className={styles.catLabel}>{categoryLabel(t, node)}</span>
        <div className={styles.num}>{count}</div>
      </Link>
      {showChildren && node.children.length ? (
        <div className={styles.subCat}>
          {node.children.map((child) => (
            <CategoryNode
              key={child.path}
              node={child}
              activePath={activePath}
              counts={counts}
              query={query}
              depth={depth + 1}
              t={t}
              hrefFor={hrefFor}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const CategoryList = (props) => {
  const hrefFor: CategoryHref = props.categoryHref || libraryCategoryHref(props.assetType)
  const { t: tc } = useTranslation('common')
  const { t } = useTranslation('categories')
  const router = useRouter()

  // The library fetches its own (SWR dedupes it with the grid's). The HDRI map passes `assets`
  // instead: only the HDRIs it plots, so the counts match its markers.
  const { data: fetched, error } = apiSWR(props.assets ? null : `/assets?t=${props.assetType}&future=true`, {
    revalidateOnFocus: false,
  })
  const data = props.assets || fetched

  // Everything except the catch-all route param carries over when changing category, so the
  // active attribute filters (and search) survive navigating the tree.
  const query = useMemo(() => {
    const carried = { ...router.query }
    delete carried.assets
    return carried
  }, [router.query])

  // Counts respect every other active filter (attributes/collection/vault) but not the category
  // itself, so the tree still shows where else you could go.
  const scoped = useMemo(
    () =>
      data
        ? filterAssets(data, {
            attributes: props.attributes,
            collection: props.collection ? props.collection.id : null,
            vault: props.vault ? props.vault.id : null,
            assetType: props.assetType,
            author: props.author,
          })
        : null,
    [data, props.attributes, props.collection, props.vault, props.assetType, props.author]
  )
  const counts = useMemo(() => (scoped ? categoryCounts(scoped) : {}), [scoped])

  if (error) return <div>Error</div>
  if (!data || !scoped) return <Spinner />

  // The "all" view has no taxonomy of its own - it lists the asset types instead.
  if (props.assetType === 'all') {
    const perType = { hdris: 0, textures: 0, models: 0 }
    const typeNames = ['hdris', 'textures', 'models']
    for (const asset of Object.values(scoped) as any[]) {
      const name = typeNames[asset.type]
      if (name) perType[name]++
    }
    // Collection and vault pages share this view. There the link leaves the collection, so it
    // can't carry the query (which holds the collection's route param) or be shallow.
    const inGroup = Boolean(props.collection || props.vault)
    return (
      <div>
        <Link
          href={inGroup ? '/all' : { pathname: '/all', query }}
          shallow={!inGroup}
          className={`${styles.cat} ${!inGroup ? styles.catActive : ''}`}
        >
          <MdKeyboardArrowRight className={styles.caret} />
          <span className={styles.catLabel}>{tc(assetTypeName('all'))}</span>
          <div className={styles.num}>{Object.keys(scoped).length}</div>
        </Link>
        {typeNames.map((type) => (
          <div key={type}>
            <Link href={`/${type}`} className={styles.cat}>
              <MdKeyboardArrowRight className={styles.caret} />
              <span className={styles.catLabel}>{tc(assetTypeName(type))}</span>
              <div className={styles.num}>{perType[type]}</div>
            </Link>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <Link
        href={hrefFor(null, query)}
        shallow
        className={`${styles.cat} ${!props.categoryPath ? styles.catActive : ''}`}
      >
        <MdKeyboardArrowRight className={styles.caret} />
        <span className={styles.catLabel}>{tc('All Things', { things: tc(assetTypeName(props.assetType)) })}</span>
        <div className={styles.num}>{Object.keys(scoped).length}</div>
      </Link>
      {getRoots(props.assetType).map((node) => (
        <CategoryNode
          key={node.path}
          node={node}
          activePath={props.categoryPath || null}
          counts={counts}
          query={query}
          depth={0}
          t={t}
          hrefFor={hrefFor}
        />
      ))}
    </div>
  )
}

export default CategoryList
