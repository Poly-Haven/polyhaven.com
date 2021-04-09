import Library from 'containers/Library/Library'

import typesAvailable from 'constants/asset_types.json';

const Page = (props) => {
  return (
    <div className="App">
      <Library assetType={props.assetType} categories={props.categories} />
    </div>
  )
}

export async function getServerSideProps(context) {
  const params = context.params.assets
  const assetType = params.shift()

  if (typesAvailable[assetType] === undefined) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      assetType: assetType,
      categories: params
    }
  }
}

export default Page;