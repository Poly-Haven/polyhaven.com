import Head from 'components/Head/Head'

import Page from 'components/Layout/Page/Page'
import Stats from 'components/Stats/Stats'

export default function HomePage({ datasets }) {
  return (
    <Page>
      <Head
        title="Stats"
        description="Site statistics for polyhaven.com."
        url="/stats"
      />
      <Stats datasets={datasets} />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok);
  }
  return response;
}

export async function getStaticProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"
  let error = null

  const msPerDay = 24 * 60 * 60 * 1000
  const today = new Date().toISOString().split('T')[0]
  const threeMonthsAgo = new Date(Date.now() - (91 * msPerDay)).toISOString().split('T')[0]

  const threeMonthsAgoBaseUrl = `${baseUrl}/stats/downloads?type=TYPE&date_from=${threeMonthsAgo}&date_to=${today}`
  const threeMonthsHDRI = await fetch(`${threeMonthsAgoBaseUrl}&slug=T0`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)
  const threeMonthsTex = await fetch(`${threeMonthsAgoBaseUrl}&slug=T1`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)
  const threeMonthsMod = await fetch(`${threeMonthsAgoBaseUrl}&slug=T2`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  if (error) {
    return {
      props: {},
      revalidate: 60 * 60 // 60 minutes
    }
  }

  return {
    props: {
      datasets: {
        threeMonths: { hdris: threeMonthsHDRI, textures: threeMonthsTex, models: threeMonthsMod },
      }
    },
    revalidate: 24 * 60 * 60 // 1 day
  }
}
