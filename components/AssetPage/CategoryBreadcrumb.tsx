import Link from 'next/link'
import { MdChevronRight } from 'react-icons/md'

import { ancestorsOf, categoryLabel, nodeFromPath } from 'utils/taxonomy'

import InfoItem from './InfoItem'
import styles from './AssetPage.module.scss'

/**
 * The asset's single category, as a compact one-line trail. Each level links to that part of the
 * library. This replaces the row of separate pills, which was an artifact of the old system where
 * an asset carried a flat list of unrelated category tags.
 */
const CategoryBreadcrumb = ({ assetType, category, label, t }) => {
  const node = category ? nodeFromPath(assetType, category) : null
  if (!node) return null

  const trail = [...ancestorsOf(assetType, node), node]

  // Wrapped in a block so it doesn't run into whatever follows: InfoItem renders an inline span.
  return (
    <div>
      <InfoItem label={label}>
        <span className={styles.catTrail}>
          {trail.map((n, i) => (
            <span key={n.path}>
              {i > 0 ? <MdChevronRight className={styles.catTrailSep} /> : null}
              <Link href={`/${assetType}/${n.slugPath}`} className={styles.catTrailCrumb} prefetch={false}>
                {categoryLabel(t, n)}
              </Link>
            </span>
          ))}
        </span>
      </InfoItem>
    </div>
  )
}

export default CategoryBreadcrumb
