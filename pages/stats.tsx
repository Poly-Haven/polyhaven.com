import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Head from 'components/Head/Head'
import { subMonths, startOfMonth, endOfMonth } from 'date-fns'

import { fixTzOffset, isoDay } from 'utils/dateUtils'

import asset_types from 'constants/asset_types.json'

import Page from 'components/Layout/Page/Page'
import Stats from 'components/Stats/Stats'

export default function HomePage({ datasets }) {
  return (
    <Page>
      <Head title="Stats" description="Site statistics for polyhaven.com." url="/stats" />
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <Stats datasets={datasets} />
      </div>
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! (${response.url}) Status: ${response.status} ${response.statusText}`)
  }
  return response
}

export async function getStaticProps(context) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'
  let error = null

  const now = new Date()
  const monthAgo = subMonths(now, 1)
  const msPerDay = 24 * 60 * 60 * 1000
  const today = new Date().toISOString().split('T')[0]
  const aMonthAgo = new Date(Date.now() - 30 * msPerDay).toISOString().split('T')[0]
  const threeMonthsAgo = new Date(Date.now() - (91 + 6) * msPerDay).toISOString().split('T')[0]
  const oneYearAgo = new Date(Date.now() - 365 * msPerDay).toISOString().split('T')[0]

  const threeMonthsAgoBaseUrl = `${baseUrl}/stats/downloads?type=TYPE&date_from=${threeMonthsAgo}&date_to=${today}`
  const fetchUrls = [
    `${threeMonthsAgoBaseUrl}&slug=T0`,
    `${threeMonthsAgoBaseUrl}&slug=T1`,
    `${threeMonthsAgoBaseUrl}&slug=T2`,
    `${baseUrl}/stats/relativetype?date_from=${aMonthAgo}&date_to=${today}`,
    `${baseUrl}/assets?future=true`,
    `${baseUrl}/stats/downloads?type=TYPE_RES&date_from=${aMonthAgo}&date_to=${today}`,
    `${baseUrl}/stats/downloads?type=TYPE_FORMAT&date_from=${aMonthAgo}&date_to=${today}`,
    `${baseUrl}/stats/relativecategory`,
    `${baseUrl}/stats/downloads?type=ALL&slug=ALL&date_from=${isoDay(
      fixTzOffset(startOfMonth(monthAgo))
    )}&date_to=${isoDay(fixTzOffset(endOfMonth(monthAgo)))}`,
    `${baseUrl}/stats/cfmonth`,
    `${baseUrl}/stats/cfdaily?date_from=${oneYearAgo}&date_to=${today}`,
    `${baseUrl}/stats/searches`,
  ]

  const fetchData = async (url) => {
    try {
      const response = await fetch(url)
      await handleErrors(response)
      return response.json()
    } catch (e) {
      console.error(`STATS: Error fetching ${url}:`, e)
      return null
    }
  }

  const [
    threeMonthsHDRI,
    threeMonthsTex,
    threeMonthsMod,
    relativeType,
    assets,
    resolutionsData,
    formatsData,
    relativecategory,
    dailyDownloads,
    traffic,
    cfdaily,
    searches,
  ] = await Promise.all(fetchUrls.map(fetchData))

  // Assets per month graph
  let months = {}
  for (const info of Object.values(assets)) {
    const month = new Date(info['date_published'] * 1000).toISOString().substring(0, 7)
    if (month > today) {
      continue
    }
    const type = Object.keys(asset_types)[info['type']]
    months[month] = months[month] || {
      hdris: 0,
      textures: 0,
      models: 0,
    }
    months[month][type]++
  }
  const sortedKeys = Object.keys(months).sort()
  let monthlyAssets = {}
  for (const k of sortedKeys) {
    monthlyAssets[k] = months[k]
  }

  // Resolution graphs
  let resolutions = {
    hdris: { total: 0 },
    textures: { total: 0 },
    models: { total: 0 },
  }
  const ignoredRes = ['12k'] // Ignore some uncommon resolutions
  for (const stat of resolutionsData) {
    const type = Object.keys(resolutions)[parseInt(stat.slug.substring(1, 2))]
    if (!type) continue
    let resStr = stat.slug.substring(4)
    if (ignoredRes.includes(resStr)) continue
    if (!resStr.endsWith('k')) continue
    const resNumStr = resStr.substr(0, resStr.length - 1)
    if (isNaN(resNumStr)) continue
    const res = parseInt(resNumStr)
    if (res >= 16) {
      resStr = '16k+'
    }
    resolutions[type][resStr] = resolutions[type][resStr] || 0
    resolutions[type][resStr] += stat.downloads
    resolutions[type].total += stat.downloads
  }
  for (const [type, reses] of Object.entries(resolutions)) {
    const sortedKeys = Object.keys(reses).sort((a, b) => parseInt(a) - parseInt(b))
    let tmp = {}
    for (const r of sortedKeys) {
      if (r === 'total') continue
      tmp[r] = (reses[r] / reses.total) * 100
    }
    resolutions[type] = tmp
  }

  // Format graphs
  let formats = {
    hdris: { total: 0 },
    textures: { total: 0 },
    models: { total: 0 },
  }
  for (const stat of formatsData) {
    const type = Object.keys(formats)[parseInt(stat.slug.substring(1, 2))]
    if (!type) continue
    let fmtStr = stat.slug.substring(4)
    if (fmtStr.includes(':')) {
      fmtStr = fmtStr.split(':').pop()
    }
    if (type === 'hdris' && ['jpg_plain', 'jpg_pretty', 'raw'].includes(fmtStr)) {
      fmtStr = 'backplate'
    }
    formats[type][fmtStr] = formats[type][fmtStr] || 0
    formats[type][fmtStr] += stat.downloads
    formats[type].total += stat.downloads
  }
  for (const [type, fmts] of Object.entries(formats)) {
    const sortedKeys = Object.keys(fmts).sort((a, b) => parseInt(a) - parseInt(b))
    let tmp = {}
    for (const r of sortedKeys) {
      if (r === 'total') continue
      tmp[r] = (fmts[r] / fmts.total) * 100
    }
    formats[type] = tmp
  }

  // Asset downloads
  let monthlyDownloads = 0
  for (const day of dailyDownloads) {
    monthlyDownloads += day.downloads
  }

  // Assets with date_published
  const assetDates = {}
  for (const [slug, info] of Object.entries(assets)) {
    assetDates[slug] = info['date_published']
  }

  if (error) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ['common'])) },
      revalidate: 60 * 60, // 60 minutes
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common'])),
      datasets: {
        threeMonths: { hdris: threeMonthsHDRI, textures: threeMonthsTex, models: threeMonthsMod },
        relativeType,
        relativecategory,
        monthlyAssets,
        resolutions,
        formats,
        monthlyDownloads,
        traffic,
        cfdaily,
        searches,
        assetDates,
      },
    },
    revalidate: 24 * 60 * 60, // 1 day
  }
}
