import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'

import TextPage from 'components/Layout/TextPage/TextPage'
import Unreal from 'components/Plugins/Unreal'

const PluginPage = ({ numAssets }) => {
  const { t } = useTranslation(['common'])

  return (
    <TextPage title="Unreal HDRI Browser" description="Get our HDRIs directly in Unreal Engine" url="/plugins/unreal">
      <Unreal numAssets={numAssets} />
    </TextPage>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
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

  const numAssets = data['hdris']

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
      numAssets: numAssets,
    },
    revalidate: 60 * 30, // 30 minutes
  }
}

export default PluginPage
