import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'

import Head from 'components/Head/Head'
import Library from 'components/Library/Library'

import typesAvailable from 'constants/asset_types.json'
import { assetTypeName } from 'utils/assetTypeName'
import asset_types from 'constants/asset_types.json'
import { hasTaxonomy, nodeFromSlugSegments, nodeFromPath, ancestorsOf, categoryLabel } from 'utils/taxonomy'
import { resolveLegacyRedirect, safeDecode } from 'utils/legacyRedirect'
import { buildLibraryJsonLd } from 'components/Library/librarySeo'

const LibraryPage = (props) => {
  const { t } = useTranslation('common')
  const { t: tcat } = useTranslation('categories')
  const router = useRouter()

  // Resolve the category from the URL rather than only from the server props, so switching
  // category can be a shallow route change: the taxonomy is bundled, so no server round-trip and
  // no refetch is needed to re-filter the already-loaded assets.
  const segments = Array.isArray(router.query.assets) ? router.query.assets.slice(1).map(safeDecode) : null
  const node = segments
    ? segments.length
      ? nodeFromSlugSegments(props.assetType, segments)
      : null
    : props.categoryPath
      ? nodeFromPath(props.assetType, props.categoryPath)
      : null
  const categoryPath = node ? node.path : null

  let title = t(assetTypeName(props.assetType))
  if (node) {
    const trail = [...ancestorsOf(props.assetType, node), node].map((n) => categoryLabel(tcat, n))
    title += ': ' + trail.join(' > ')
  }

  let imageUrl = `https://polyhaven.com/api/og-image?type=${props.assetType}`
  if (node) {
    imageUrl += `&categories=${encodeURIComponent(node.name)}`
  }

  let description = ''
  if (node) {
    description = node.description ? `${node.description} ` : ''
    description += `Free ${node.name}`
  } else {
    if (props.assetType === 'hdris') {
      description += 'Previously known as HDRI Haven. '
    }
    description += 'Hundreds of free'
  }
  const typeDescription = {
    hdris: 'HDRI environments',
    textures: 'PBR texture sets',
    models: '3D models',
    all: 'HDRIs, textures, and 3D models',
  }
  description += ` ${typeDescription[props.assetType]}, ready to use for any purpose. No login required.`

  const jsonLd = buildLibraryJsonLd(props.assetType, node, title, description)

  return (
    <>
      <Head
        title={title}
        url={`/${props.assetType}${node ? '/' + node.slugPath : ''}`}
        description={description}
        assetType={asset_types[props.assetType]}
        image={imageUrl}
      >
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
          />
        ) : null}
      </Head>
      <Library
        assetType={props.assetType}
        categoryPath={categoryPath}
        collections={props.assetType === 'all' ? props.collections : {}}
        collection={null}
        author={props.author}
        search={props.search}
        strictSearch={props.strictSearch}
        sort={props.sort}
      />
    </>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export async function getServerSideProps(context) {
  const params = [...context.params.assets]
  const assetType = params.shift()
  const author = context.query.a
  const search = context.query.s
  const strictSearch = context.query.strict
  let sort = context.query.o

  const translations = async () =>
    await serverSideTranslations(context.locale, ['common', 'home', 'library', 'categories', 'time'])

  // Next does not localise `redirect` destinations from getServerSideProps, so without this every
  // legacy URL under a locale (/de/hdris/outdoor) lands the visitor on the English page.
  const localised = (destination: string) =>
    context.locale && context.locale !== context.defaultLocale ? `/${context.locale}${destination}` : destination

  if (typesAvailable[assetType] === undefined) {
    return {
      notFound: true,
      props: { ...(await translations()) },
    }
  }

  // Resolve the remaining path segments against the taxonomy. Anything that isn't a real category
  // is either an old legacy URL (301 to its new home) or genuinely gone (404).
  let categoryPath = null
  let categorySlugPath = ''
  if (params.length) {
    if (assetType === 'all') {
      // /all only ever had asset types beneath it.
      const first = safeDecode(params[0])
      if (typesAvailable[first] !== undefined && first !== 'all') {
        return { redirect: { destination: localised(`/${first}`), permanent: true } }
      }
      return { redirect: { destination: localised('/all'), permanent: true } }
    }

    const node = hasTaxonomy(assetType) ? nodeFromSlugSegments(assetType, params.map(safeDecode)) : null
    if (node) {
      categoryPath = node.path
      categorySlugPath = node.slugPath
    } else {
      const destination = resolveLegacyRedirect(assetType, params, context.query)
      if (destination) {
        return { redirect: { destination: localised(destination), permanent: true } }
      }
      return {
        notFound: true,
        props: { ...(await translations()) },
      }
    }
  }

  const allowedSorts = ['hot', 'latest', 'top', 'name']
  if (!allowedSorts.includes(sort)) {
    sort = 'hot'
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  const collections = await fetch(`${baseUrl}/collections`)
    .then(handleErrors)
    .then((response) => response.json())
  const collectionNames = {}
  for (const name of Object.keys(collections)) {
    collectionNames[name] = collections[name].name
  }

  return {
    props: {
      ...(await translations()),
      assetType: assetType,
      categoryPath,
      categorySlugPath,
      collections: collectionNames,
      author: author ? author : '',
      search: search ? search : '',
      strictSearch: strictSearch ? true : false,
      sort: sort ? sort : 'hot',
    },
  }
}

export default LibraryPage
