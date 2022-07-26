import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import TextPage from 'components/Layout/TextPage/TextPage'
import Popularity from 'components/Stats/Popularity/Popularity'

export default function HomePage({ finances }) {
  return (
    <TextPage
      title="HDRI Popularity"
      description="Popularity ratings of HDRIs used for bonus earning calculations."
      url="/popularity"
    >
      <Popularity data={finances} />
    </TextPage>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok);
  }
  return response;
}

export async function getServerSideProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"
  let error = null

  const finances = await fetch(`${baseUrl}/finances`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  if (error) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ['common'])) }
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      finances
    }
  }
}