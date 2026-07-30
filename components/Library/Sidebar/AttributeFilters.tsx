import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { attributeSchema } from 'utils/taxonomy'
import { attributeCounts } from 'utils/assetFiltering'

import styles from './Sidebar.module.scss'

/**
 * Facet filters for asset attributes (weather, condition, material, …).
 *
 * Attributes describe qualities an asset *has*, as opposed to the category, which is what an asset
 * *is*. They live in the query string so a filtered view can be linked and shared, and are applied
 * with shallow routing — the URL updates but no navigation happens, so filtering is instant and
 * costs no extra request.
 *
 * Booleans are only ever stored when true, so they render as self-describing checkbox chips with
 * no group label, gathered together at the bottom.
 */

const prettify = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const AttributeFilters = ({ assetType, assets, active }) => {
  const router = useRouter()
  const { t } = useTranslation('library')

  const schema = attributeSchema[assetType]
  const counts = useMemo(
    () => (schema && assets ? attributeCounts(assets, assetType) : null),
    [schema, assets, assetType]
  )

  if (!schema || !assets || !counts) return null

  const label = (key: string) => t(`attr.${key}`, { defaultValue: prettify(key) })
  const valueLabel = (value: string) => t(`attrValue.${value}`, { defaultValue: prettify(value) })

  // Shallow so the URL reflects the filters without triggering a navigation/data fetch.
  const pushQuery = (query: Record<string, any>) => {
    delete query.assets // the catch-all route param isn't a real query value
    router.push({ pathname: router.asPath.split('?')[0], query }, undefined, { shallow: true })
  }

  const toggle = (key: string, value: string) => {
    const current = active[key] || []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    const query = { ...router.query }
    if (next.length) query[key] = next.join(',')
    else delete query[key]
    pushQuery(query)
  }

  const clearAll = () => {
    const query = { ...router.query }
    for (const key of Object.keys(schema)) delete query[key]
    pushQuery(query)
  }

  const isBoolean = (spec: any) => spec.type === 'boolean' || spec.type === 'boolean|null'

  // Only offer values that actually exist in the current result set.
  const availableFor = (key: string, spec: any): string[] =>
    isBoolean(spec)
      ? counts[key] && counts[key]['true']
        ? ['true']
        : []
      : (spec.enum || []).filter((v: string) => counts[key] && counts[key][v])

  const chip = (key: string, value: string, spec: any) => {
    const on = (active[key] || []).includes(value)
    const bool = isBoolean(spec)
    return (
      <button
        key={`${key}:${value}`}
        type="button"
        className={`${styles.attrChip} ${on ? styles.attrChipOn : ''}`}
        onClick={() => toggle(key, value)}
        title={spec.description}
      >
        {bool ? <input type="checkbox" className={styles.attrCheckbox} checked={on} readOnly tabIndex={-1} /> : null}
        {bool ? label(key) : valueLabel(value)}
        <span className={styles.attrCount}>{(counts[key] && counts[key][value]) || 0}</span>
      </button>
    )
  }

  const entries = Object.entries(schema) as [string, any][]

  const enumSections = entries
    .filter(([, spec]) => !isBoolean(spec))
    .map(([key, spec]) => {
      const available = availableFor(key, spec)
      if (!available.length) return null
      return (
        <div key={key} className={styles.attrGroup}>
          <div className={styles.attrLabel}>{label(key)}</div>
          <div className={styles.attrValues}>{available.map((value) => chip(key, value, spec))}</div>
        </div>
      )
    })

  const booleanChips = entries
    .filter(([, spec]) => isBoolean(spec))
    .flatMap(([key, spec]) => availableFor(key, spec).map((value) => chip(key, value, spec)))

  if (!enumSections.some(Boolean) && !booleanChips.length) return null

  const anyActive = Object.keys(schema).some((k) => (active[k] || []).length)

  return (
    <div className={styles.attrFilters}>
      <div className={styles.attrHeader}>
        <h3>{t('attr.title', { defaultValue: 'Filters' })}</h3>
        {anyActive ? (
          <button type="button" className={styles.attrClear} onClick={clearAll}>
            {t('attr.clear', { defaultValue: 'Clear' })}
          </button>
        ) : null}
      </div>
      {enumSections}
      {booleanChips.length ? (
        <div className={`${styles.attrGroup} ${styles.attrBooleans}`}>
          <div className={styles.attrValues}>{booleanChips}</div>
        </div>
      ) : null}
    </div>
  )
}

export default AttributeFilters
