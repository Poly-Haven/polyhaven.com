import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { MdCheckBox, MdCheckBoxOutlineBlank, MdClose } from 'react-icons/md'

import { attributeSchema } from 'utils/taxonomy'
import { attributeCounts, authorCounts } from 'utils/assetFiltering'
import { setQueryShallow } from 'utils/shallowQuery'

import Dropdown from 'components/UI/Dropdown/Dropdown'

import styles from './Sidebar.module.scss'

const ANY_AUTHOR = '__any'

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

const AttributeFilters = ({ assetType, assets, active, author }) => {
  const router = useRouter()
  const { t } = useTranslation('library')

  const schema = attributeSchema[assetType]
  const counts = useMemo(
    () => (schema && assets ? attributeCounts(assets, assetType) : null),
    [schema, assets, assetType]
  )
  // Authors of whatever is currently in scope, most prolific first.
  const authors = useMemo(() => (assets ? authorCounts(assets) : null), [assets])

  if (!assets || !authors) return null

  const label = (key: string) => t(`attr.${key}`, { defaultValue: prettify(key) })
  const valueLabel = (value: string) => t(`attrValue.${value}`, { defaultValue: prettify(value) })

  const toggle = (key: string, value: string) => {
    const current = active[key] || []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    setQueryShallow(router, (query) => {
      if (next.length) query[key] = next.join(',')
      else delete query[key]
    })
  }

  const clearAll = () => {
    setQueryShallow(router, (query) => {
      // `schema` is undefined on /all, which has no per-type attributes but still offers the
      // author filter.
      for (const key of Object.keys(schema || {})) delete query[key]
      delete query.a // the author filter lives in this panel too
    })
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
        {bool ? (
          <span className={styles.attrCheckbox}>{on ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}</span>
        ) : null}
        {bool ? label(key) : valueLabel(value)}
        <span className={styles.attrCount}>{(counts[key] && counts[key][value]) || 0}</span>
      </button>
    )
  }

  // --- author -------------------------------------------------------------------------------
  // Keeps the existing ?a= param so links to an author's work from elsewhere keep working.
  const authorOptions = {
    [ANY_AUTHOR]: { label: t('adv.any-author', { defaultValue: 'Anyone' }) },
    ...Object.fromEntries(
      Object.entries(authors)
        .sort(([aName, aCount], [bName, bCount]) => bCount - aCount || aName.localeCompare(bName))
        .map(([name, count]) => [name, { label: name, sub: String(count) }])
    ),
  }
  const setAuthor = (value: string) => {
    setQueryShallow(router, (query) => {
      if (value && value !== ANY_AUTHOR) query.a = value
      else delete query.a
    })
  }
  const authorSection = Object.keys(authors).length ? (
    <div className={styles.attrGroup}>
      <div className={styles.attrLabel}>{t('author', { count: 1, defaultValue: 'Author' })}</div>
      <Dropdown
        value={author && authors[author] ? author : ANY_AUTHOR}
        options={authorOptions}
        onChange={setAuthor}
        tooltipSide="right"
      />
    </div>
  ) : null

  const entries = Object.entries(schema || {}) as [string, any][]

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

  if (!enumSections.some(Boolean) && !booleanChips.length && !authorSection) return null

  const anyActive = Boolean(author) || Object.keys(schema || {}).some((k) => (active[k] || []).length)

  return (
    <div className={styles.attrFilters}>
      <div className={styles.attrHeader}>
        <h3>
          {t('attr.title', { defaultValue: 'Filters' })}
          {anyActive ? (
            <button
              type="button"
              className={styles.attrClear}
              onClick={clearAll}
              title={t('attr.clear', { defaultValue: 'Clear' })}
            >
              <MdClose />
            </button>
          ) : null}
        </h3>
      </div>
      {authorSection}
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
