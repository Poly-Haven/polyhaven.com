import Head from 'components/Head/Head'

import asset_types from 'constants/asset_types.json'

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
  const aMonthAgo = new Date(Date.now() - (30 * msPerDay)).toISOString().split('T')[0]
  const threeMonthsAgo = new Date(Date.now() - ((91 + 6) * msPerDay)).toISOString().split('T')[0]

  // Three months graph
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

  // Relative type graph
  const relativeType = await fetch(`${baseUrl}/stats/relativetype?date_from=${aMonthAgo}&date_to=${today}`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)

  // Assets per month graph
  const assets = await fetch(`${baseUrl}/assets`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)
  let months = {}
  for (const info of Object.values(assets)) {
    const month = new Date(info['date_published'] * 1000).toISOString().substring(0, 7)
    const type = Object.keys(asset_types)[info['type']]
    months[month] = months[month] || {
      hdris: 0,
      textures: 0,
      models: 0,
    }
    months[month][type]++;
  }
  const sortedKeys = Object.keys(months).sort()
  let monthlyAssets = {}
  for (const k of sortedKeys) {
    monthlyAssets[k] = months[k]
  }

  // Resolution graphs
  const resolutionsData = await fetch(`${baseUrl}/stats/downloads?type=TYPE_RES&date_from=${aMonthAgo}&date_to=${today}`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => error = e)
  let resolutions = {
    hdris: { total: 0 },
    textures: { total: 0 },
    models: { total: 0 },
  }
  const ignoredRes = ['12k'] // Ignore some uncommon resolutions
  for (const stat of resolutionsData) {
    const type = Object.keys(resolutions)[parseInt(stat.slug.substring(1, 2))]
    let resStr = stat.slug.substring(4)
    if (ignoredRes.includes(resStr)) continue
    if (!resStr.endsWith('k')) continue
    const resNumStr = resStr.substr(0, resStr.length - 1)
    if (isNaN(resNumStr)) continue
    const res = parseInt(resNumStr)
    if (res >= 16) {
      resStr = "16k+"
    }
    resolutions[type][resStr] = resolutions[type][resStr] || 0
    resolutions[type][resStr] += stat.downloads;
    resolutions[type].total += stat.downloads;
  }
  for (const [type, reses] of Object.entries(resolutions)) {
    const sortedKeys = Object.keys(reses).sort((a, b) => parseInt(a) - parseInt(b))
    let tmp = {}
    for (const r of sortedKeys) {
      if (r === 'total') continue
      tmp[r] = reses[r] / reses.total * 100
    }
    resolutions[type] = tmp
  }

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
        relativeType,
        monthlyAssets,
        resolutions
      }
    },
    revalidate: 24 * 60 * 60 // 1 day
  }
}
