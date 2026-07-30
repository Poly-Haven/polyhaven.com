import Link from 'next/link'

import { attributeSchema } from 'utils/taxonomy'

import InfoItem from './InfoItem'
import styles from './AssetPage.module.scss'

/**
 * The asset's attributes — the qualities it has (weather, condition, material…), as opposed to the
 * category, which is what it is. Each links to the library filtered by that value, so they work as
 * a way in to similar assets rather than just being labels.
 *
 * Booleans are only stored when true, so they show as a bare label ("Rigged") rather than a pair.
 */
const prettify = (value: string) => String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const AssetAttributes = ({ assetType, attributes, label, t }) => {
  const schema = attributeSchema[assetType]
  if (!schema || !attributes) return null

  const label_ = (key: string) => t(`attr.${key}`, { defaultValue: prettify(key) })
  const valueLabel = (value: string) => t(`attrValue.${value}`, { defaultValue: prettify(value) })

  // Follow the schema's order so assets of the same type read consistently.
  const pills: { key: string; text: string; tip: string; href: string }[] = []
  for (const [key, spec] of Object.entries(schema) as [string, any][]) {
    const value = attributes[key]
    if (value === undefined || value === null || value === '') continue

    if (spec.type === 'boolean' || spec.type === 'boolean|null') {
      if (value !== true) continue
      pills.push({
        key,
        text: label_(key),
        tip: spec.description,
        href: `/${assetType}?${key}=true`,
      })
      continue
    }

    for (const v of Array.isArray(value) ? value : [value]) {
      if (v === undefined || v === null || v === '') continue
      pills.push({
        key: `${key}:${v}`,
        text: valueLabel(String(v)),
        tip: `${label_(key)} — ${spec.description}`,
        href: `/${assetType}?${key}=${encodeURIComponent(String(v))}`,
      })
    }
  }

  if (!pills.length) return null

  return (
    <InfoItem label={label}>
      <span className={styles.tagsList}>
        {pills.map((pill) => (
          <Link key={pill.key} href={pill.href} prefetch={false}>
            <span className={styles.tag} data-tip={pill.tip}>
              {pill.text}
            </span>
          </Link>
        ))}
      </span>
    </InfoItem>
  )
}

export default AssetAttributes
