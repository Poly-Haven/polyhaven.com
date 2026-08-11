import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'components/Head/Head'

import { assetTypeName } from 'utils/assetTypeName'
import { vaultOf, vaultStatus } from 'utils/vaults'

import AssetPage from 'components/AssetPage/AssetPage'
import ErrorPage from 'components/Layout/Page/CenteredPage'
import { buildAssetJsonLd } from 'components/AssetPage/assetSeo'

function handleErrors(response) {
  if (!response.ok) {
    const error: any = new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
    // Kept so callers can tell "this asset does not exist" (404) apart from "the API is unwell" (5xx).
    error.status = response.status
    throw error
  }
  return response
}

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

// During `next build` getStaticProps below runs once per asset, thousands of times per worker
// process, and two of its four requests return identical bytes every single time: /assets already
// contains every field this page reads out of /info/[id], and /stats/post_download takes no
// parameters at all. Fetch those two once per worker rather than once per page.
// Build time only, so on-demand regeneration still reads fresh data on every request.
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
const buildCache = new Map()

const fetchOncePerBuild = (path) => {
  const cached = buildCache.get(path)
  if (cached) {
    return cached
  }
  const request = fetch(`${apiBase}${path}`)
    .then(handleErrors)
    .then((response) => response.json())
  buildCache.set(path, request)
  // Never let one failed request poison every remaining page in the build.
  request.catch(() => buildCache.delete(path))
  return request
}

const Page = ({ assetID, data, files, renders, postDownloadStats, vaultInfo }) => {
  const pageUrl = `/a/${assetID}`
  if (!data) {
    return (
      <ErrorPage>
        <Head title="Error: 404" url={pageUrl} />
        <h1>404</h1>
        <p>No asset with id: "{assetID}"</p>
      </ErrorPage>
    )
  }
  const jsonLd = buildAssetJsonLd(assetID, data)

  return (
    <div className="content">
      <Head
        title={`${data.name} ${assetTypeName(data.type, false)}`}
        description={data.description || `Download this free ${assetTypeName(data.type, false)} from Poly Haven`}
        url={pageUrl}
        assetType={data.type}
        author={Object.keys(data.authors).join(', ')}
        keywords={`${data.categories.join(',')},${data.tags.join(',')}`}
        image={`https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=630&quality=95`}
      >
        {jsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
          />
        ) : null}
      </Head>
      <div>
        <AssetPage
          assetID={assetID}
          data={data}
          files={files}
          renders={renders}
          postDownloadStats={postDownloadStats}
          vaultInfo={vaultInfo}
        />
      </div>
    </div>
  )
}

export async function getStaticProps(context) {
  const id = context.params.id
  const baseUrl = apiBase

  let error = null
  // Tracked separately from `error`: only /info can say whether an asset exists. /files and
  // /renders are not authoritative enough to 404 a page on.
  let infoError = null

  const fetchInfo = () =>
    fetch(`${baseUrl}/info/${id}`)
      .then(handleErrors)
      .then((response) => response.json())

  // /assets leaves out only reviewers, staging, old_id and scale, none of which this site reads.
  // Ids it does not list (staging or future dated) fall back to /info/[id] further down.
  const infoRequest = isBuild ? fetchOncePerBuild('/assets').then((assets) => assets[id]) : fetchInfo()

  const statsRequest = isBuild
    ? fetchOncePerBuild('/stats/post_download')
    : fetch(`${baseUrl}/stats/post_download`)
        .then(handleErrors)
        .then((response) => response.json())

  // Only the vault that produced this asset is passed down, and only the fields the callout reads:
  // the full /vaults map carries a slug list per vault, which would land in every page's
  // __NEXT_DATA__ for nothing. Its catch is deliberately its own and swallows to null - feeding the
  // shared `error` below would turn a /vaults blip into a data-less render on *every* asset page.
  const vaultsRequest = (isBuild ? fetchOncePerBuild('/vaults') : fetch(`${baseUrl}/vaults`).then(handleErrors).then((r) => r.json())).catch(
    () => null
  )

  // None of these depend on each other, so let them overlap instead of running back to back.
  // Each keeps its own catch, so no promise here can reject and fail the whole set.
  let [info, files, renders, postDownloadStats, vaults] = await Promise.all([
    infoRequest.catch((e) => (infoError = error = e)),
    fetch(`${baseUrl}/files/${id}`)
      .then(handleErrors)
      .then((response) => response.json())
      .catch((e) => (error = e)),
    fetch(`${baseUrl}/renders/${id}`)
      .then(handleErrors)
      .then((response) => response.json())
      .catch((e) => (error = e)),
    statsRequest.catch((e) => (error = e)),
    vaultsRequest,
  ])

  // An id missing from /assets is either unpublished or does not exist, so let /info decide which.
  if (isBuild && !info && !error) {
    info = await fetchInfo().catch((e) => (infoError = error = e))
  }

  // A 404 from /info means the asset genuinely does not exist, so serve a real 404. Returning props
  // without `data` instead renders a 200 page titled "Error: 404", which search engines index as a
  // soft 404 and ISR then caches - an unbounded surface, since /a/<anything> hits this path.
  // Early access assets are safe here: they are absent from /assets but /info still answers 200.
  // Any other failure keeps the soft render, so an API blip never 404s a real asset.
  if (infoError && infoError.status === 404) {
    return {
      notFound: true,
      revalidate: 60 * 60, // 1 hour - short enough that a newly published asset appears promptly
    }
  }

  if (error) {
    console.error(error)
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ['common', 'asset', 'categories', 'library', 'time'])),
        assetID: id,
      },
      revalidate: 60 * 5, // 5 minutes
    }
  }

  const vaultId = vaultOf(info)
  const vault = vaultId && vaults ? vaults[vaultId] : null

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'asset', 'categories', 'library', 'time'])),
      assetID: id,
      data: info,
      files: files,
      renders: renders,
      postDownloadStats: postDownloadStats,
      vaultInfo: vault
        ? {
            id: vaultId,
            name: vault.name || null,
            status: vaultStatus(vault),
            // A date string ("2025-09-05") when achieved, otherwise false.
            unlocked: vault.unlocked || null,
          }
        : null,
    },
    revalidate: 60 * 60 * 4, // 4 hours
  }
}

export async function getStaticPaths() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  const data = await fetch(`${baseUrl}/assets`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => console.log(e))

  const paths = Object.keys(data).map((a) => ({ params: { id: a } }))

  return {
    paths,
    fallback: 'blocking',
  }
}

export default Page
