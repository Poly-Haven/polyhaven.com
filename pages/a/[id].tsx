import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'components/Head/Head'

import { assetTypeName } from 'utils/assetTypeName'

import AssetPage from 'components/AssetPage/AssetPage'
import ErrorPage from 'components/Layout/Page/CenteredPage'

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
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

const Page = ({ assetID, data, files, renders, postDownloadStats }) => {
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
      />
      <div>
        <AssetPage
          assetID={assetID}
          data={data}
          files={files}
          renders={renders}
          postDownloadStats={postDownloadStats}
        />
      </div>
    </div>
  )
}

export async function getStaticProps(context) {
  const id = context.params.id
  const baseUrl = apiBase

  let error = null

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

  // None of these depend on each other, so let them overlap instead of running back to back.
  // Each keeps its own catch, so no promise here can reject and fail the whole set.
  let [info, files, renders, postDownloadStats] = await Promise.all([
    infoRequest.catch((e) => (error = e)),
    fetch(`${baseUrl}/files/${id}`)
      .then(handleErrors)
      .then((response) => response.json())
      .catch((e) => (error = e)),
    fetch(`${baseUrl}/renders/${id}`)
      .then(handleErrors)
      .then((response) => response.json())
      .catch((e) => (error = e)),
    statsRequest.catch((e) => (error = e)),
  ])

  // An id missing from /assets is either unpublished or does not exist, so let /info decide which.
  if (isBuild && !info && !error) {
    info = await fetchInfo().catch((e) => (error = e))
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

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'asset', 'categories', 'library', 'time'])),
      assetID: id,
      data: info,
      files: files,
      renders: renders,
      postDownloadStats: postDownloadStats,
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
