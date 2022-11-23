import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import TextPage from 'components/Layout/TextPage/TextPage'
import PopularityTex from 'components/Stats/Popularity/PopularityTex'

export default function HomePage({ finances }) {
  return (
    <TextPage
      title="Texture Popularity"
      description="Popularity ratings of textures used for bonus earning calculations."
      url="/popularity-tex"
    >
      <PopularityTex data={finances} />
    </TextPage>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok)
  }
  return response
}

export async function getServerSideProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const finances = await fetch(`${baseUrl}/finances`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))

  if (error) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ['common'])) },
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      finances,
    },
  }
}
