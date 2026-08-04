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
 * with shallow routing - the URL updates but no navigation happens, so filtering is instant and
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
  // Counts answer "how many would I see if I clicked this", so each facet is counted against the
  // set narrowed by every other active filter. See attributeCounts for why a facet excludes itself.
  const counts = useMemo(
    () => (schema && assets ? attributeCounts(assets, assetType, active, author) : null),
    [schema, assets, assetType, active, author]
  )
  // Authors of whatever is currently in scope, most prolific first.
  const authors = useMemo(
    () => (assets ? authorCounts(assets, assetType, active, author) : null),
    [assets, assetType, active, author]
  )

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

  // Only a plain boolean. There is no "boolean|null" any more: anything that needed a third state
  // is an enum, so the two-state chip is now an honest representation of everything it renders.
  const isBoolean = (spec: any) => spec.type === 'boolean'

  // Only offer values that exist in the current result set - but never hide one that is already
  // selected, or another facet narrowing it to zero would leave it stuck on with no way to clear it.
  const selected = (key: string, value: string) => (active[key] || []).includes(value)
  const availableFor = (key: string, spec: any): string[] =>
    isBoolean(spec)
      ? (counts[key] && counts[key]['true']) || selected(key, 'true')
        ? ['true']
        : []
      : (spec.enum || []).filter((v: string) => (counts[key] && counts[key][v]) || selected(key, v))

  const chip = (key: string, value: string, spec: any) => {
    const on = (active[key] || []).includes(value)
    const bool = isBoolean(spec)
    return (
      <button
        key={`${key}:${value}`}
        type="button"
        className={`${styles.attrChip} ${on ? styles.attrChipOn : ''}`}
        onClick={() => toggle(key, value)}
      >
        {bool ? <span className={styles.attrCheckbox}>{on ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}</span> : null}
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
      <div className={styles.attrDropdown}>
        <Dropdown
          value={author && authors[author] ? author : ANY_AUTHOR}
          options={authorOptions}
          onChange={setAuthor}
          align="left"
          mini
          inline
          tooltipSide="right"
        />
      </div>
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
      {enumSections}
      {booleanChips.length ? (
        <div className={`${styles.attrGroup} ${styles.attrBooleans}`}>
          <div className={styles.attrValues}>{booleanChips}</div>
        </div>
      ) : null}
      {authorSection}
    </div>
  )
}

export default AttributeFilters
