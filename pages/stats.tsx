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
  const theStart = '2021-06-01' // Start of polyhaven.com
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
    `${baseUrl}/stats/taxonomy`,
    `${baseUrl}/stats/downloads?type=ALL&slug=ALL&date_from=${isoDay(
      fixTzOffset(startOfMonth(monthAgo))
    )}&date_to=${isoDay(fixTzOffset(endOfMonth(monthAgo)))}`,
    `${baseUrl}/stats/cfmonth`,
    `${baseUrl}/stats/cfdaily?date_from=${oneYearAgo}&date_to=${today}`,
    `${baseUrl}/stats/searches`,
    `${baseUrl}/stats/patron_count`,
    `${baseUrl}/stats/software`,
    `${baseUrl}/stats/cfdownloads`,
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
    taxonomy,
    dailyDownloads,
    traffic,
    cfdaily,
    searches,
    patronCounts,
    software,
    cfdownloads,
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

  // Resolution and format graphs: each bar is how often an option is picked when the asset offers it.
  // A share of every download of the type made options few assets have (16k textures, backplates) look
  // unpopular. The denominators come from `eligible_res` / `eligible_backplates` on each day's
  // TYPE doc (see admin utils/downloadEligibility.ts), which the three-month fetch already carries.
  // Only days that have them are counted, so a type with none falls back to the plain share.
  const typeNames = ['hdris', 'textures', 'models']
  const eligibleDays = {}
  const eligibleRes = {}
  const eligibleBackplates = {}
  for (const [type, docs] of Object.entries({ hdris: threeMonthsHDRI, textures: threeMonthsTex, models: threeMonthsMod })) {
    eligibleDays[type] = new Set()
    eligibleRes[type] = {}
    eligibleBackplates[type] = 0
    for (const doc of docs || []) {
      if (doc.day < aMonthAgo || !doc.eligible_res) continue
      eligibleDays[type].add(doc.day)
      for (const [r, n] of Object.entries(doc.eligible_res)) eligibleRes[type][r] = (eligibleRes[type][r] || 0) + n
      eligibleBackplates[type] += doc.eligible_backplates || 0
    }
  }
  const counted = (type, day) => !eligibleDays[type].size || eligibleDays[type].has(day)
  const toPercentages = (type, counts, total, denominatorFor) => {
    let tmp = {}
    for (const k of Object.keys(counts).sort((a, b) => parseInt(a) - parseInt(b))) {
      const d = eligibleDays[type].size ? denominatorFor(k) : total
      if (d) tmp[k] = (counts[k] / d) * 100
    }
    return tmp
  }

  let resolutions = {}
  for (const type of typeNames) {
    let counts = {}
    let total = 0
    for (const stat of resolutionsData || []) {
      if (typeNames[parseInt(stat.slug.substring(1, 2))] !== type || !counted(type, stat.day)) continue
      const m = stat.slug.substring(4).match(/^(\d+)k$/)
      if (!m) continue
      const res = parseInt(m[1])
      // Only the standard ladder. The odd sizes (9k, 12k, 14k...) are a few assets' own maximums, and
      // as a take rate one asset's audience would plot as a large bar of its own.
      if (res < 16 && (res & (res - 1)) !== 0) continue
      const k = res >= 16 ? '16k+' : `${res}k`
      counts[k] = (counts[k] || 0) + stat.downloads
      total += stat.downloads
    }
    // Every asset that offers anything at or above 16k also offers 16k itself.
    resolutions[type] = toPercentages(type, counts, total, (k) => eligibleRes[type][k === '16k+' ? '16k' : k])
  }

  let formats = {}
  for (const type of typeNames) {
    let counts = {}
    let total = 0
    for (const stat of formatsData || []) {
      if (typeNames[parseInt(stat.slug.substring(1, 2))] !== type || !counted(type, stat.day)) continue
      let fmtStr = stat.slug.substring(4)
      if (fmtStr.includes(':')) {
        fmtStr = fmtStr.split(':').pop()
      }
      if (type === 'hdris' && ['jpg_plain', 'jpg_pretty', 'raw'].includes(fmtStr)) {
        fmtStr = 'backplate'
      }
      counts[fmtStr] = (counts[fmtStr] || 0) + stat.downloads
      total += stat.downloads
    }
    // Backplates are the only format not every asset of its type offers.
    formats[type] = toPercentages(type, counts, total, (k) => (k === 'backplate' ? eligibleBackplates[type] : total))
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
      // `library` carries the attribute and value labels the attribute chart reuses, so the names
      // on the chart match the names in the library's own filter sidebar.
      ...(await serverSideTranslations(context.locale, ['common', 'library'])),
      datasets: {
        // The eligibility fields were only needed above; dropped so they don't ride along in __NEXT_DATA__.
        threeMonths: Object.fromEntries(
          Object.entries({ hdris: threeMonthsHDRI, textures: threeMonthsTex, models: threeMonthsMod }).map(([t, docs]) => [
            t,
            docs && docs.map(({ eligible_res, eligible_backplates, ...doc }) => doc),
          ])
        ),
        relativeType,
        taxonomy,
        monthlyAssets,
        resolutions,
        formats,
        monthlyDownloads,
        traffic,
        cfdaily,
        searches,
        assetDates,
        patronCounts,
        software,
        cfdownloads,
      },
    },
    revalidate: 24 * 60 * 60, // 1 day
  }
}
