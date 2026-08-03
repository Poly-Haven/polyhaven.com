import { ancestorsOf, nodeFromPath } from 'utils/taxonomy'
import { assetTypeName } from 'utils/assetTypeName'
import asset_types from 'constants/asset_types.json'

/* ---------------------------------------------------------------------------
 * Structured data for asset pages.
 *
 * Everything is derived from the `data` the page already fetches, so a new asset
 * gets this for free. Deliberately limited to properties we can state truthfully:
 *
 *  - No Product/Offer. The assets are free and CC0, there is no rating or review
 *    data anywhere in the API, and Product markup on ineligible pages risks a
 *    structured-data manual action. Do not add it because it "sounds impressive".
 *  - No per-file `encoding`. The /files payload nests differently per asset type
 *    (models bundle their textures under `include`), so listing sizes and formats
 *    accurately needs per-type logic. Better absent than wrong.
 * ------------------------------------------------------------------------- */

const SITE = 'https://polyhaven.com'
const CC0 = 'https://creativecommons.org/publicdomain/zero/1.0/'

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Poly Haven',
  url: SITE,
  logo: `${SITE}/Logo%20256.png`,
}

// Reverse of constants/asset_types.json (name -> id), so a numeric type becomes "hdris"/"textures"/
// "models". `all` maps to null there and is not a real asset type, so it is dropped.
const TYPE_SLUG: Record<number, string> = Object.fromEntries(
  Object.entries(asset_types as Record<string, number | null>)
    .filter(([, id]) => typeof id === 'number')
    .map(([slug, id]) => [id as number, slug])
)

export function buildAssetJsonLd(assetID: string, data: any) {
  if (!data || !data.name) return null

  const url = `${SITE}/a/${assetID}`
  const typeSlug = TYPE_SLUG[data.type]
  const authors = Object.keys(data.authors || {})

  // The preview PNG is what the page actually displays and what Google Images can crawl -
  // so it, not the multi-gigabyte source file, is the image being described here.
  const preview = `https://cdn.polyhaven.com/asset_img/primary/${assetID}.png?height=760`
  const thumbnail = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=630`

  // A 3D model is not an image; everything else on this site fundamentally is one.
  const isModel = data.type === 2

  const asset: Record<string, any> = {
    '@type': isModel ? '3DModel' : 'ImageObject',
    '@id': `${url}#asset`,
    name: data.name,
    url,
    mainEntityOfPage: url,
    // The single most citable fact about this library, stated where machines read it.
    license: CC0,
    acquireLicensePage: `${SITE}/license`,
    copyrightNotice: 'CC0 1.0 Universal - public domain dedication, no attribution required',
    creditText: authors.length ? authors.join(', ') : 'Poly Haven',
    isAccessibleForFree: true,
    isFamilyFriendly: true,
    inLanguage: 'en',
    publisher: PUBLISHER,
    thumbnailUrl: thumbnail,
  }

  // 3DModel extends MediaObject, where contentUrl means the model file - so the preview
  // belongs in `image` there, and in `contentUrl` for the types that really are images.
  if (isModel) {
    asset.image = preview
    if (data.polycount) asset.numberOfPolygons = data.polycount
  } else {
    asset.contentUrl = preview
    asset.encodingFormat = 'image/png'
  }

  if (data.description) asset.description = data.description
  if (authors.length) asset.creator = authors.map((name) => ({ '@type': 'Person', name }))
  if (data.date_published) {
    asset.datePublished = new Date(data.date_published * 1000).toISOString().slice(0, 10)
  }

  const keywords = [...(data.categories || []), ...(data.tags || [])].filter(Boolean)
  if (keywords.length) asset.keywords = keywords.join(', ')

  // Mirrors the trail CategoryBreadcrumb renders on the page. English names on purpose:
  // asset pages serve identical English copy in every locale.
  const itemListElement: Record<string, any>[] = [
    { '@type': 'ListItem', position: 1, name: 'Poly Haven', item: SITE },
  ]
  if (typeSlug) {
    itemListElement.push({
      '@type': 'ListItem',
      position: itemListElement.length + 1,
      name: assetTypeName(data.type),
      item: `${SITE}/${typeSlug}`,
    })
    const node = data.category ? nodeFromPath(typeSlug, data.category) : null
    if (node) {
      for (const n of [...ancestorsOf(typeSlug, node), node]) {
        itemListElement.push({
          '@type': 'ListItem',
          position: itemListElement.length + 1,
          name: n.name,
          item: `${SITE}/${typeSlug}/${n.slugPath}`,
        })
      }
    }
  }
  itemListElement.push({
    '@type': 'ListItem',
    position: itemListElement.length + 1,
    name: data.name,
    item: url,
  })

  return {
    '@context': 'https://schema.org',
    '@graph': [
      asset,
      { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement },
    ],
  }
}
