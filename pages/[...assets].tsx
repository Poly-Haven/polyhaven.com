import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import Head from 'components/Head/Head'
import Library from 'components/Library/Library'

import typesAvailable from 'constants/asset_types.json';
import { assetTypeName } from 'utils/assetTypeName'
import asset_types from 'constants/asset_types.json'
import { titleCase } from 'utils/stringUtils'

const LibraryPage = (props) => {
  const { t } = useTranslation('common');

  let title = t(assetTypeName(props.assetType))
  if (props.categories.length) {
    title += ": " + titleCase(props.categories.join(' > '))
  }

  let imageUrl = `https://dev.polyhaven.com/api/og-image?type=${props.assetType}`
  if (props.categories.length) {
    imageUrl += `&categories=${props.categories.join(',')}`
  }

  return (
    <>
      <Head
        title={title}
        url={`/${props.assetType}/${props.categories.join('/')}`}
        description={`Hundreds of free ${title === 'Models' ? '3D models' : title}, ready to use for any purpose.`}
        assetType={asset_types[props.assetType]}
        image={imageUrl}
      />
      <Library
        assetType={props.assetType}
        categories={props.categories}
        author={props.author}
        search={props.search}
        sort={props.sort}
      />
    </>
  )
}

export async function getServerSideProps(context) {
  const params = context.params.assets
  const assetType = params.shift()
  const author = context.query.a
  const search = context.query.s
  let sort = context.query.o

  if (typesAvailable[assetType] === undefined) {
    return {
      notFound: true,
      props: {
        ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time']))
      }
    }
  }

  const allowedSorts = [
    "hot",
    "latest",
    "top",
    "name"
  ]
  if (!allowedSorts.includes(sort)) {
    sort = "hot";
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'library', 'categories', 'time'])),
      assetType: assetType,
      categories: params,
      author: author ? author : "",
      search: search ? search : "",
      sort: sort ? sort : "hot"
    }
  }
}

export default LibraryPage;