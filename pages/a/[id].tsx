import Head from 'next/head'
import DefaultErrorPage from 'next/error'

import assetTypeNames from 'constants/asset_type_names.json'

import AssetPage from 'components/AssetPage/AssetPage'

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok);
  }
  return response;
}

const Page = ({ assetID, data }) => {
  if (!data) {
    return (<DefaultErrorPage statusCode={404} />)
  }
  return (
    <div className="content">
      <Head>
        <title>{assetTypeNames[data.type]}: {data.name} • Poly Haven</title>
      </Head>
      <div>
        <AssetPage assetID={assetID} data={data} />
      </div>
    </div>
  )
}

export async function getStaticProps(context) {
  const id = context.params.id

  let error = null
  const data = await fetch(`https://api.polyhaven.com/info/${id}`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  if (error) {
    return {
      props: {}
    }
  }

  return {
    props: {
      assetID: id,
      data: data
    }
  }
}

export async function getStaticPaths() {
  const data = await fetch(`https://api.polyhaven.com/assets`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => console.log(e));

  const paths = Object.keys(data).map((a) => ({ params: { id: a } }));

  return {
    paths,
    fallback: true
  };
}


export default Page
