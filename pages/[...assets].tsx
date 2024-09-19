import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import Head from 'components/Head/Head'
import Library from 'components/Library/Library'

import typesAvailable from 'constants/asset_types.json'
import { assetTypeName } from 'utils/assetTypeName'
import asset_types from 'constants/asset_types.json'
import { titleCase } from 'utils/stringUtils'

const LibraryPage = (props) => {
  const { t } = useTranslation('common')

  let title = t(assetTypeName(props.assetType))
  if (props.categories.length) {
    title += ': ' + titleCase(props.categories.join(' > '))
  }

  let imageUrl = `https://polyhaven.com/api/og-image?type=${props.assetType}`
  if (props.categories.length) {
    imageUrl += `&categories=${props.categories.join(',')}`
  }

  let description = ''
  if (props.categories.length) {
    description = `Free ${props.categories[props.categories.length - 1]}`
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

  return (
    <>
      <Head
        title={title}
        url={`/${props.assetType}/${props.categories.join('/')}`}
        description={description}
        assetType={asset_types[props.assetType]}
        image={imageUrl}
      />
      <Library
        assetType={props.assetType}
        categories={props.categories}
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
    throw Error(response.ok)
  }
  return response
}

export async function getServerSideProps(context) {
  const params = context.params.assets
  const assetType = params.shift()
  const author = context.query.a
  const search = context.query.s
  const strictSearch = context.query.strict
  let sort = context.query.o

  if (typesAvailable[assetType] === undefined) {
    return {
      notFound: true,
      props: {
        ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
      },
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
      ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
      assetType: assetType,
      categories: params,
      collections: collectionNames,
      author: author ? author : '',
      search: search ? search : '',
      strictSearch: strictSearch ? true : false,
      sort: sort ? sort : 'hot',
    },
  }
}

export default LibraryPage
