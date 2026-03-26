import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'
import Lighthouse from 'components/Projects/Lighthouse'

export default function ProjectLighthouse() {
  return (
    <Page>
      <Head
        title="Project Lighthouse"
        description="Poly Haven's biggest adventure yet"
        url="/project/lighthouse"
        image="https://cdn.polyhaven.com/site_images/projects/lighthouse/feature.jpg?width=630&quality=95"
      />
      <Lighthouse />
    </Page>
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

  const allAssets = await fetch(`${baseUrl}/assets?t=all`)
    .then(handleErrors)
    .then((response) => response.json())
    .catch((e) => (error = e))
  const lighthouseAssets = Object.fromEntries(
    Object.entries(allAssets).filter(([_, asset]) => asset['categories'].includes('collection:project_lighthouse'))
  )

  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'time'])),
      assets: lighthouseAssets,
    },
  }
}
