import { isInCategory, attributeSchema } from 'utils/taxonomy'

/**
 * Client-side filtering and counting for the library.
 *
 * The grid already holds every asset of the current type, so category/attribute/collection/vault
 * filtering happens in the browser - instant, and it lets the sidebar show accurate inclusive
 * counts without a second round-trip.
 */

export type AttributeFilters = Record<string, string[]>

const isTrue = (v: any) => v === true || v === 'true' || v === 1 || v === '1'

/** Read recognised attribute filters out of a Next.js router query. */
export const attributeFiltersFromQuery = (query: Record<string, any>, assetType: string): AttributeFilters => {
  const schema = attributeSchema[assetType]
  const allowed = new Set(
    schema ? Object.keys(schema) : Object.values(attributeSchema).flatMap((s) => Object.keys(s))
  )
  const filters: AttributeFilters = {}
  for (const [key, value] of Object.entries(query || {})) {
    if (!allowed.has(key) || value === undefined || value === '') continue
    const values = String(value)
      .split(',')
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean)
    if (values.length) filters[key] = values
  }
  return filters
}

/** The reserved query value that selects the empty side of an array attribute (e.g. pristine). */
const EMPTY_ALIASES = ['none', 'pristine']

/**
 * Which branch a filter takes has to come from the schema rather than from the shape of the
 * requested value, otherwise `?condition=false` reads as a boolean test against a string[] and
 * quietly matches every asset. Mirrors api/utils/assetFilters.js.
 */
export const attributeSpec = (assetType: string, key: string): any => {
  const schema = attributeSchema[assetType]
  if (schema) return schema[key] || null
  for (const spec of Object.values(attributeSchema)) {
    if ((spec as any)[key]) return (spec as any)[key]
  }
  return null
}

export const matchesAttributes = (asset: any, filters: AttributeFilters, assetType: string): boolean => {
  const attrs = asset?.attributes || {}
  for (const [key, wanted] of Object.entries(filters)) {
    const actual = attrs[key]
    const type = attributeSpec(assetType, key)?.type

    if (type === 'boolean') {
      // Only ever stored when true, so absent means false. Sound because every attribute whose
      // false side is a thing in its own right is an enum instead.
      if (!wanted.includes(String(isTrue(actual)))) return false
      continue
    }
    if (type === 'string[]') {
      // Tolerate a scalar as well as an array, so this behaves the same before and after the data
      // migration (models.condition used to be a single string).
      const list = Array.isArray(actual) ? actual : actual === undefined || actual === null || actual === '' ? [] : [actual]
      if (!list.length) {
        if (!wanted.some((w) => EMPTY_ALIASES.includes(w))) return false
        continue
      }
      if (!list.some((a) => wanted.includes(String(a).toLowerCase()))) return false
      continue
    }
    // enum and enum|null: absent means never assessed, which matches nothing.
    if (actual === undefined || actual === null) return false
    if (Array.isArray(actual)) {
      if (!actual.some((a) => wanted.includes(String(a).toLowerCase()))) return false
      continue
    }
    if (!wanted.includes(String(actual).toLowerCase())) return false
  }
  return true
}

export const inCollection = (asset: any, id: string): boolean =>
  (Array.isArray(asset?.collections) && asset.collections.includes(id)) ||
  // Legacy fallback: collections used to live inside the categories array.
  (Array.isArray(asset?.categories) && asset.categories.includes(`collection: ${id}`))

export const inVault = (asset: any, id: string): boolean =>
  asset?.vault === id || (Array.isArray(asset?.categories) && asset.categories.includes(`vault: ${id}`))

interface FilterOptions {
  categoryPath?: string | null
  attributes?: AttributeFilters
  collection?: string | null
  vault?: string | null
  assetType?: string
}

/** Filter a { slug: asset } map. Returns a new object, leaving the input untouched. */
export const filterAssets = (data: Record<string, any>, opts: FilterOptions): Record<string, any> => {
  const { categoryPath, attributes, collection, vault, assetType } = opts
  const hasAttrs = attributes && Object.keys(attributes).length > 0
  if (!categoryPath && !hasAttrs && !collection && !vault) return data

  const out: Record<string, any> = {}
  for (const [slug, asset] of Object.entries(data)) {
    if (categoryPath && !isInCategory(asset.category, categoryPath)) continue
    if (collection && !inCollection(asset, collection)) continue
    if (vault && !inVault(asset, vault)) continue
    if (hasAttrs && !matchesAttributes(asset, attributes, assetType)) continue
    out[slug] = asset
  }
  return out
}

/**
 * Inclusive asset counts per category path - a parent's count includes every descendant,
 * so the sidebar reads like a Blender catalog.
 */
export const categoryCounts = (data: Record<string, any>): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const asset of Object.values(data)) {
    const category = asset?.category
    if (typeof category !== 'string' || !category) continue
    const parts = category.split('/')
    for (let i = 1; i <= parts.length; i++) {
      const path = parts.slice(0, i).join('/')
      counts[path] = (counts[path] || 0) + 1
    }
  }
  return counts
}

/** How many assets each author contributed to, for the author filter's options. */
export const authorCounts = (data: Record<string, any>): Record<string, number> => {
  const counts: Record<string, number> = {}
  for (const asset of Object.values(data)) {
    for (const author of Object.keys(asset?.authors || {})) {
      counts[author] = (counts[author] || 0) + 1
    }
  }
  return counts
}

/** How many assets have each value of each attribute (used to show/hide facet options). */
export const attributeCounts = (data: Record<string, any>, assetType: string): Record<string, Record<string, number>> => {
  const schema = attributeSchema[assetType] || {}
  const counts: Record<string, Record<string, number>> = {}
  for (const key of Object.keys(schema)) counts[key] = {}
  for (const asset of Object.values(data)) {
    const attrs = asset?.attributes || {}
    for (const [key, spec] of Object.entries(schema)) {
      const value = attrs[key]
      const bucket = counts[key]
      if ((spec as any).type === 'boolean') {
        if (isTrue(value)) bucket['true'] = (bucket['true'] || 0) + 1
      } else if (Array.isArray(value)) {
        for (const v of value) bucket[String(v)] = (bucket[String(v)] || 0) + 1
      } else if (value !== undefined && value !== null && value !== '') {
        bucket[String(value)] = (bucket[String(value)] || 0) + 1
      }
    }
  }
  return counts
}
