import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import Head from 'components/Head/Head'
import Library from 'components/Library/Library'

import typesAvailable from 'constants/asset_types.json'
import { assetTypeName } from 'utils/assetTypeName'
import asset_types from 'constants/asset_types.json'
import { titleCase } from 'utils/stringUtils'

const LibraryPage = (props) => {
  return (
    <>
      <Head
        title={props.collection.name}
        url={`/collections/${props.collection.id}/${props.assetType}/${props.categories.join('/')}`}
        description={props.collection.description}
        assetType={asset_types[props.assetType]}
        image={`https://cdn.polyhaven.com/collections/${props.collection.id}.png?width=580`}
      />
      <Library
        assetType={props.assetType}
        categories={props.categories}
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
      },
    }
  }

  const assetType = 'all'
  // if (typesAvailable[assetType] === undefined) {
  //   return {
  //     notFound: true,
  //     props: {
  //       ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
  //     },
  //   }
  // }

  const allowedSorts = ['hot', 'latest', 'top', 'name']
  if (!allowedSorts.includes(sort)) {
    sort = 'hot'
  }

  const collectionData = collections[collectionID]
  collectionData.id = collectionID

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
      assetType: assetType,
      collection: collectionData,
      categories: [`collection: ${collectionID}`, ...params],
      author: author ? author : '',
      search: search ? search : '',
      strictSearch: strictSearch ? true : false,
      sort: sort ? sort : 'hot',
    },
  }
}

export default LibraryPage
