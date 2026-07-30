import taxonomyData from 'constants/taxonomy.json'
import attributeData from 'constants/attributes.json'

/**
 * The single-path category taxonomy. Every asset belongs to exactly ONE category, stored on
 * `asset.category` as a canonical path like "Coast & Water/Beaches/Sandy Beaches".
 *
 * Browsing is INCLUSIVE, matching Blender's catalog semantics: opening a parent category shows
 * everything nested beneath it, and assets may live at any level of the tree.
 *
 * URLs use each node's `slugPath` (e.g. /hdris/coast-water/beaches). The canonical `path` is what
 * we compare against asset data; the slug is purely for the URL.
 *
 * Generated from admin's category registry — see constants/taxonomy.json.
 */

export interface TaxonomyNode {
  name: string
  slug: string
  path: string
  slugPath: string
  id: string
  description: string
  children: TaxonomyNode[]
}

const TREES: Record<string, TaxonomyNode[]> = (taxonomyData as any).types
export const attributeSchema: Record<string, Record<string, any>> = (attributeData as any).types

export const hasTaxonomy = (assetType: string): boolean => Boolean(TREES[assetType])

export const getRoots = (assetType: string): TaxonomyNode[] => TREES[assetType] || []

// Flat lookups, built once per type on first use.
const flatCache: Record<string, { bySlugPath: Map<string, TaxonomyNode>; byPath: Map<string, TaxonomyNode> }> = {}
const flatten = (assetType: string) => {
  if (flatCache[assetType]) return flatCache[assetType]
  const bySlugPath = new Map<string, TaxonomyNode>()
  const byPath = new Map<string, TaxonomyNode>()
  const walk = (nodes: TaxonomyNode[]) => {
    for (const n of nodes) {
      bySlugPath.set(n.slugPath, n)
      byPath.set(n.path, n)
      walk(n.children)
    }
  }
  walk(getRoots(assetType))
  flatCache[assetType] = { bySlugPath, byPath }
  return flatCache[assetType]
}

export const allNodes = (assetType: string): TaxonomyNode[] => Array.from(flatten(assetType).byPath.values())

/** Resolve URL segments (["coast-water","beaches"]) to a node, or null if the path isn't real. */
export const nodeFromSlugSegments = (assetType: string, segments: string[]): TaxonomyNode | null => {
  if (!segments || !segments.length) return null
  return flatten(assetType).bySlugPath.get(segments.join('/').toLowerCase()) || null
}

export const nodeFromPath = (assetType: string, path: string): TaxonomyNode | null =>
  (path && flatten(assetType).byPath.get(path)) || null

/** The node's ancestors, root first, excluding the node itself. */
export const ancestorsOf = (assetType: string, node: TaxonomyNode): TaxonomyNode[] => {
  const parts = node.path.split('/')
  const out: TaxonomyNode[] = []
  for (let i = 1; i < parts.length; i++) {
    const ancestor = nodeFromPath(assetType, parts.slice(0, i).join('/'))
    if (ancestor) out.push(ancestor)
  }
  return out
}

/** Inclusive match — the category itself plus everything nested beneath it. */
export const isInCategory = (assetCategory: string | undefined, categoryPath: string): boolean =>
  typeof assetCategory === 'string' &&
  (assetCategory === categoryPath || assetCategory.startsWith(categoryPath + '/'))

/** Browse URL for a category node, e.g. /hdris/coast-water/beaches */
export const categoryUrl = (assetType: string, node: TaxonomyNode | null): string =>
  node ? `/${assetType}/${node.slugPath}` : `/${assetType}`

/**
 * i18n key for a category node. Keyed by slug path so names that repeat in different branches
 * (e.g. "Industrial" as both a top-level HDRI category and a sub-category of "Abandoned & Ruins")
 * can be translated independently. Falls back to the English name when a key is missing.
 */
export const categoryLabel = (t: any, node: TaxonomyNode): string =>
  String(t(node.slugPath, { defaultValue: node.name }))
