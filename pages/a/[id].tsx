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

  const fullUrl = `https://polyhaven.com${pageUrl}`
  const description = data.description || `Download this free ${assetTypeName(data.type, false)} from Poly Haven`

  const renderImageName = (assetName: string, filename: string): string => {
    const f = filename.toLowerCase()
    const typeSuffix = (data.type === 2 ? '3D Model' : assetTypeName(data.type, false)) + ' render'
    if (f === 'clay.png') return `${assetName} wireframe clay ${typeSuffix}`
    if (f.startsWith('orth_front')) return `${assetName} front view ${typeSuffix}`
    if (f.startsWith('orth_side')) return `${assetName} side view ${typeSuffix}`
    if (f.startsWith('orth_top')) return `${assetName} top view ${typeSuffix}`
    if (f.startsWith('orth_back')) return `${assetName} back view ${typeSuffix}`
    if (f.startsWith('orth_')) return `${assetName} orthographic ${typeSuffix}`
    if (f.startsWith('cam_')) return `${assetName} ${typeSuffix}`
    if (/(reference|context)/i.test(f)) return `${assetName} reference ${typeSuffix}`
    return `${assetName} ${typeSuffix}`
  }

  const renderImages = renders
    ? Object.keys(renders).map((filename) => {
        const meta = typeof renders[filename] === 'object' ? renders[filename] : {}
        return {
          '@type': 'ImageObject',
          contentUrl: `https://cdn.polyhaven.com/asset_img/renders/${assetID}/${filename}`,
          name: meta.title || renderImageName(data.name, filename),
          ...(meta.author ? { creditText: meta.author } : {}),
          ...(meta.url ? { acquireLicensePage: meta.url } : {}),
        }
      })
    : []

  const primaryImage = {
    '@type': 'ImageObject',
    contentUrl: `https://cdn.polyhaven.com/asset_img/primary/${assetID}.png`,
    name: `${data.name} preview`,
  }

  const diffuseImage =
    data.type === 1 && files?.Diffuse
      ? (() => {
          const resolutions = ['1k', '2k', '4k']
          for (const res of resolutions) {
            const url = files.Diffuse[res]?.jpg?.url
            if (url) {
              return {
                '@type': 'ImageObject',
                contentUrl: url,
                name: `${data.name} seamless PBR texture diffuse map`,
              }
            }
          }
          return null
        })()
      : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': data.type === 2 ? '3DModel' : 'CreativeWork',
    name: data.name,
    description,
    url: fullUrl,
    keywords: [...data.categories, ...data.tags].join(', '),
    license: 'https://creativecommons.org/publicdomain/zero/1.0/',
    isAccessibleForFree: true,
    author: Object.keys(data.authors).map((name) => ({ '@type': 'Person', name })),
    image: [primaryImage, ...renderImages, ...(diffuseImage ? [diffuseImage] : [])],
    ...(data.type === 2
      ? {
          encodingFormat: 'model/gltf-binary',
          additionalType: `https://schema.org/3DModel`,
        }
      : {}),
  }

  return (
    <div className="content">
      <Head
        title={`${data.name} ${data.type === 2 ? '3D Model' : data.type === 1 ? 'PBR Texture' : assetTypeName(data.type, false)}`}
        description={description}
        url={pageUrl}
        assetType={data.type}
        author={Object.keys(data.authors).join(', ')}
        keywords={`${data.categories.join(',')},${data.tags.join(',')}`}
        image={`https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=630&quality=95`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  let error = null

  const info = await fetch(`${baseUrl}/info/${id}`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  const files = await fetch(`${baseUrl}/files/${id}`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  const renders = await fetch(`${baseUrl}/renders/${id}`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  const postDownloadStats = await fetch(`${baseUrl}/stats/post_download`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  if (error) {
    console.error(error)
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ['common', 'asset', 'categories', 'time'])),
        assetID: id,
      },
      revalidate: 60 * 5, // 5 minutes
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'asset', 'categories', 'time'])),
      assetID: id,
      data: info,
      files: files,
      renders: renders,
      postDownloadStats: postDownloadStats,
    },
    revalidate: 60 * 30, // 30 minutes
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
