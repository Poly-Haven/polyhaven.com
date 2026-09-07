import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { getImageVersions } from 'utils/imageVersions'
import { cdnUrl } from 'utils/cdn'

import Head from 'components/Head/Head'
import Library from 'components/Library/Library'

import asset_types from 'constants/asset_types.json'

const LibraryPage = (props) => {
  return (
    <>
      <Head
        title={props.collection.name}
        url={`/collections/${props.collection.id}`}
        description={props.collection.description}
        assetType={asset_types[props.assetType]}
        image={cdnUrl(
          `collections/${props.collection.id}.png`,
          { width: 580, quality: 95 },
          props.imageVersions?.[`collections/${props.collection.id}.png`]
        )}
      />
      <Library
        assetType={props.assetType}
        categoryPath={null}
        collections={{}}
        collection={props.collection}
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
  const params = context.params.collection
  const collectionID = params.shift()
  const author = context.query.a
  const search = context.query.s
  const strictSearch = context.query.strict
  let sort = context.query.o

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const collections = await fetch(`${baseUrl}/collections`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  if (!Object.keys(collections).includes(collectionID)) {
    return {
      notFound: true,
      props: {
        ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
        // Non-asset image versions for _app's ImageVersionsProvider. Fetched here rather than per
        // pageview: getStaticProps runs at build time and on revalidation only.
        imageVersions: await getImageVersions(['collections', 'people', 'vaults', 'site_images/news_cards']),
      },
    }
  }

  const allowedSorts = ['hot', 'latest', 'top', 'name']
  if (!allowedSorts.includes(sort)) {
    sort = 'hot'
  }

  const collectionData = collections[collectionID]
  collectionData.id = collectionID

  // Safe to cache at the edge: the asset list is fetched client-side by the shared Library grid, so
  // this HTML is visitor-independent and doesn't go stale as assets publish. See [...assets].tsx.
  //
  // With one exception, and it is the reason this page can't just reuse that header verbatim.
  // CollectionHeader decides "Submissions are open!" by comparing submission_deadline to the clock
  // during render (components/Library/Collections/CollectionHeader.tsx), so it is the one thing here
  // that changes on time rather than on a publish. A cached copy would keep inviting entries to a
  // closed challenge. Cap the edge TTL at whatever is left, and drop stale-while-revalidate, which
  // would otherwise let a stale "open" banner live another day past the deadline.
  const deadlineMs = collectionData.submission_deadline ? Date.parse(collectionData.submission_deadline) : NaN
  const secondsLeft = Number.isNaN(deadlineMs) ? -1 : Math.floor((deadlineMs - Date.now()) / 1000)
  context.res.setHeader(
    'Cache-Control',
    secondsLeft > 0
      ? `public, max-age=0, s-maxage=${Math.min(3600, secondsLeft)}`
      : 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
  )

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
      assetType: 'all',
      collection: collectionData,
      author: author ? author : '',
      search: search ? search : '',
      strictSearch: strictSearch ? true : false,
      sort: sort ? sort : 'hot',
    },
  }
}

export default LibraryPage
