import Link from 'next/link'

import { attributeSchema } from 'utils/taxonomy'

import styles from './AssetPage.module.scss'

/**
 * The asset's attributes, as pills that link into the library filtered by that value.
 *
 * Most values speak for themselves ("Afternoon", "Weathered", "Partly Cloudy"), but some are
 * meaningless stripped of what they describe: "Low" and "Natural" only mean something as "Low
 * contrast" and "Natural light". Those get their attribute's noun appended, which is why this is a
 * per-value rule rather than a blanket one.
 */

// The noun appended to a value that needs it.
const CONTEXT_NOUN: Record<string, string> = {
  contrast: 'contrast',
  light_type: 'light',
  weather: 'weather',
  surface_use: 'surface',
}

// `true` = every value of this attribute needs the noun, an array = only those listed do.
const NEEDS_CONTEXT: Record<string, true | string[]> = {
  contrast: true, // "Low" -> "Low contrast"
  light_type: true, // "Natural" -> "Natural light"
  weather: ['clear'], // "Clear" -> "Clear weather", but "Overcast" stands alone
  surface_use: ['ground', 'object'], // "Wall" is clear enough, "Object" is not
}

const prettify = (value: string) => String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

const AssetAttributes = ({ assetType, attributes, t }) => {
  const schema = attributeSchema[assetType]
  if (!schema || !attributes) return null

  const attrLabel = (key: string) => t(`attr.${key}`, { defaultValue: prettify(key) })
  const valueLabel = (value: string) => t(`attrValue.${value}`, { defaultValue: prettify(value) })

  const needsContext = (key: string, value: string) => {
    const rule = NEEDS_CONTEXT[key]
    return rule === true || (Array.isArray(rule) && rule.includes(value))
  }

  const pillLabel = (key: string, value: string) => {
    const base = valueLabel(value)
    if (!needsContext(key, value)) return base
    const noun = t(`attrNoun.${key}`, { defaultValue: CONTEXT_NOUN[key] || '' })
    // Looked up as a whole phrase so a translation can reorder the words.
    return t(`attrFull.${key}.${value}`, { defaultValue: `${base} ${noun}`.trim() })
  }

  // Follow the schema's order so assets of the same type read consistently.
  const pills: { key: string; text: string; tip: string; href: string }[] = []
  for (const [key, spec] of Object.entries(schema) as [string, any][]) {
    const value = attributes[key]
    if (value === undefined || value === null || value === '') continue

    if (spec.type === 'boolean' || spec.type === 'boolean|null') {
      if (value !== true) continue
      pills.push({ key, text: attrLabel(key), tip: spec.description, href: `/${assetType}?${key}=true` })
      continue
    }

    for (const v of Array.isArray(value) ? value : [value]) {
      if (v === undefined || v === null || v === '') continue
      pills.push({
        key: `${key}:${v}`,
        text: pillLabel(key, String(v)),
        tip: `${attrLabel(key)}: ${spec.description}`,
        href: `/${assetType}?${key}=${encodeURIComponent(String(v))}`,
      })
    }
  }

  if (!pills.length) return null

  return (
    <div className={styles.attrPills}>
      {pills.map((pill) => (
        <Link key={pill.key} href={pill.href} prefetch={false} className={styles.attrPill} data-tip={pill.tip}>
          {pill.text}
        </Link>
      ))}
    </div>
  )
}

export default AssetAttributes
