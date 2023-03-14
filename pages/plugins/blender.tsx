import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import TextPage from 'components/Layout/TextPage/TextPage'
import Blender from 'components/Plugins/Blender'

const PluginPage = ({ numAssets }) => {
  const { t } = useTranslation(['common'])

  return (
    <TextPage
      title="Blender Add-on"
      description="Get our assets directly in Blender's asset browser"
      url="/about-contact"
    >
      <Blender numAssets={numAssets} />
    </TextPage>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok)
  }
  return response
}

export async function getStaticProps({ locale }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const data = await fetch(`${baseUrl}/categories/all?future=true`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  const numAssets = data['all']

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      numAssets: numAssets,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}

export default PluginPage
