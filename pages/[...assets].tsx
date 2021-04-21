import Head from 'next/head';

import Library from 'containers/Library/Library'

import typesAvailable from 'constants/asset_types.json';
import assetTypeNames from 'constants/asset_type_names.json'
import { titleCase } from 'utils/stringUtils'

const LibraryPage = (props) => {
  let title = assetTypeNames[typesAvailable[props.assetType]] + 's'
  if (props.categories.length) {
    title += ": " + titleCase(props.categories.join(' > '))
  }
  title += " • Poly Haven"

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Library assetType={props.assetType} categories={props.categories} />
    </>
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

export default LibraryPage;