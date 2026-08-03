import { ancestorsOf, TaxonomyNode } from 'utils/taxonomy'
import { assetTypeName } from 'utils/assetTypeName'

/* ---------------------------------------------------------------------------
 * Structured data for the library browse pages (/hdris, /textures/wood, ...).
 *
 * No ItemList: the asset grid is fetched client-side, so the server has no list
 * of items to describe. Claiming one we cannot render would be markup that does
 * not match the page. Worth revisiting if the grid is ever server-rendered.
 * ------------------------------------------------------------------------- */

const SITE = 'https://polyhaven.com'

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Poly Haven',
  url: SITE,
  logo: `${SITE}/Logo%20256.png`,
}

export function buildLibraryJsonLd(
  assetType: string,
  node: TaxonomyNode | null,
  title: string,
  description: string
) {
  if (!assetType) return null

  const url = `${SITE}/${assetType}${node ? '/' + node.slugPath : ''}`

  // English names on purpose - matching the asset pages, and the trail here is the
  // canonical taxonomy rather than the translated label shown in the UI.
  const itemListElement: Record<string, any>[] = [
    { '@type': 'ListItem', position: 1, name: 'Poly Haven', item: SITE },
    { '@type': 'ListItem', position: 2, name: assetTypeName(assetType), item: `${SITE}/${assetType}` },
  ]
  if (node) {
    for (const n of [...ancestorsOf(assetType, node), node]) {
      itemListElement.push({
        '@type': 'ListItem',
        position: itemListElement.length + 1,
        name: n.name,
        item: `${SITE}/${assetType}/${n.slugPath}`,
      })
    }
  }

  const page: Record<string, any> = {
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    name: title,
    description,
    url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', '@id': `${SITE}/#website` },
    publisher: PUBLISHER,
    // Every asset behind this page is CC0, so the listing itself is free to use too.
    isAccessibleForFree: true,
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
  }
  if (node) page.about = node.name

  return {
    '@context': 'https://schema.org',
    '@graph': [page, { '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement }],
  }
}
