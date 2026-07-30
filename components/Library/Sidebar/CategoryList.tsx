import { useMemo } from 'react'
import Link from 'next/link'
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

const CategoryNode = ({
  node,
  assetType,
  activePath,
  counts,
  query,
  depth,
  t,
}: {
  node: TaxonomyNode
  assetType: string
  activePath: string | null
  counts: Record<string, number>
  query: Record<string, any>
  depth: number
  t: any
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
        href={{ pathname: `/${assetType}/${node.slugPath}`, query }}
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
              assetType={assetType}
              activePath={activePath}
              counts={counts}
              query={query}
              depth={depth + 1}
              t={t}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const CategoryList = (props) => {
  const { t: tc } = useTranslation('common')
  const { t } = useTranslation('categories')
  const router = useRouter()

  const { data, error } = apiSWR(`/assets?t=${props.assetType}&future=true`, { revalidateOnFocus: false })

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
          })
        : null,
    [data, props.attributes, props.collection, props.vault]
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
    return (
      <div>
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
      {getRoots(props.assetType).map((node) => (
        <CategoryNode
          key={node.path}
          node={node}
          assetType={props.assetType}
          activePath={props.categoryPath || null}
          counts={counts}
          query={query}
          depth={0}
          t={t}
        />
      ))}
    </div>
  )
}

export default CategoryList
