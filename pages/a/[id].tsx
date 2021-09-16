import Head from 'components/Head/Head'

import { assetTypeName } from 'utils/assetTypeName'

import AssetPage from 'components/AssetPage/AssetPage'
import ErrorPage from 'components/Layout/Page/CenteredPage'

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok);
  }
  return response;
}

const Page = ({ assetID, data, files, renders }) => {
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
        description={`Download this free ${assetTypeName(data.type, false)} from Poly Haven`}
        url={pageUrl}
        assetType={data.type}
        author={Object.keys(data.authors).join(', ')}
        keywords={`${data.categories.join(',')},${data.tags.join(',')}`}
        image={`https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=630`}
      />
      <div>
        <AssetPage assetID={assetID} data={data} files={files} renders={renders} />
      </div>
    </div>
  )
}

export async function getStaticProps(context) {
  const id = context.params.id
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"

  let error = null

  const info = await fetch(`${baseUrl}/info/${id}`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  const files = await fetch(`${baseUrl}/files/${id}`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  const renders = await fetch(`${baseUrl}/renders/${id}`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  if (error) {
    return {
      props: {
        assetID: id
      },
      revalidate: 60 * 5 // 5 minutes
    }
  }

  return {
    props: {
      assetID: id,
      data: info,
      files: files,
      renders: renders,
    },
    revalidate: 60 * 30 // 30 minutes
  }
}

export async function getStaticPaths() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"
  const data = await fetch(`${baseUrl}/assets`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => console.log(e));

  const paths = Object.keys(data).map((a) => ({ params: { id: a } }));

  return {
    paths,
    fallback: 'blocking'
  };
}


export default Page
