import { useState } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  ReferenceLine,
  Brush,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from 'recharts'

import { filesize } from 'filesize'

import Dropdown from 'components/UI/Dropdown/Dropdown'
import { formatNumber } from 'utils/stringUtils'
import { MdWarning } from 'react-icons/md'

import { typeColors, typeNames, seriesColors } from './chartColors'

import styles from './Stats.module.scss'

const average = (array) => array.reduce((a, b) => a + b) / array.length

interface AssetDates {
  slug: number
}

type TypeCounts = { hdris: number | null; textures: number | null; models: number | null }

type SourceCounts = { web: number | null; addon: number | null; selfref: number | null; other: number | null }

// api /stats/cfdownloads: per UTC day, Cloudflare's asset downloads by type and by source, beside
// dlTrack's `unique`.
interface CfDownloads {
  [day: string]: { cf: TypeCounts; sources?: SourceCounts; dltrack: TypeCounts }
}

const downloadTypes = ['hdris', 'textures', 'models']

// Stacked bottom-up, so the website band sits on the axis where the dashed dlTrack line can be read
// against it. `selfref` (links followed from our own non-site hosts, ~0.2%) is too thin to see as a
// band of its own, so it is folded into other.
const downloadSources = [
  { key: 'web', name: 'Website', color: seriesColors[0] },
  { key: 'addon', name: 'Blender add-on', color: seriesColors[1] },
  { key: 'other', name: 'Other (scripts, tools, direct links)', color: seriesColors[2] },
]

const TrafficGraph = ({
  data,
  assetDates,
  downloads,
}: {
  data: any
  assetDates: AssetDates
  downloads?: CfDownloads | null
}) => {
  const [dataType, setdataType] = useState('bytes')

  let graphData = []
  let days = []
  for (const [day, stats] of Object.entries(data)) {
    days.push(day)
    const dayData = {
      day: day,
      uniques: 0,
      pageViews: 0,
      requests: 0,
      threats: 0,
      bytes: 0,
      bytesPerUser: 0,
      requestsPerUser: 0,
      assetsPublished: 0,
      usersPerAsset: 0,
    }
    for (const siteData of Object.values(stats)) {
      if (!siteData.data) continue
      const d = siteData.data.viewer.zones[0].httpRequests1dGroups[0]
      if (!d) continue
      dayData.uniques += d.uniq.uniques
      dayData.pageViews += d.sum.pageViews
      dayData.requests += d.sum.requests
      dayData.threats += d.sum.threats
      dayData.bytes += d.sum.bytes
    }
    for (const [slug, datePublished] of Object.entries(assetDates)) {
      const date = new Date(datePublished * 1000).toISOString().split('T')[0]
      if (date < day) {
        dayData.assetsPublished++
      }
    }

    dayData.bytesPerUser += dayData.bytes / dayData.uniques
    dayData.requestsPerUser += dayData.requests / Math.max(1, dayData.uniques)
    dayData.usersPerAsset += dayData.uniques / dayData.assetsPublished

    graphData.push(dayData)
  }

  // Smoothed data
  let i = 0
  for (const day of graphData) {
    for (const [key, value] of Object.entries(day)) {
      if (key === 'day') continue
      const weeks = 2
      const adjacentDays = weeks * 7 - 4
      const smoothFac = 7
      let values = Array(smoothFac).fill(value)
      for (var j = 1; j <= adjacentDays; j++) {
        for (var k = 0; k < smoothFac - j; k++) {
          if (i - j >= 0) {
            values.push(graphData[i - j][key])
          }
          if (i + j < graphData.length) {
            values.push(graphData[i + j][key])
          }
        }
      }
      day[`s:${key}`] = average(values)
    }
    i++
  }

  const all_notes = {}
  // Remove notes not in displayed date range
  const notes = {}
  for (const [d, n] of Object.entries(all_notes)) {
    if (Object.keys(days).includes(d)) {
      notes[d] = n
    }
  }

  // Downloads only exist from late Aug 2026, so they get their own day range rather than sitting at
  // the end of a mostly empty year. `dl:` keys are dlTrack, drawn dashed in the same type colour.
  const downloadsData = Object.entries(downloads || {})
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, d]) => {
      const row = { day }
      for (const t of downloadTypes) {
        row[t] = d.cf[t]
        row[`dl:${t}`] = d.dltrack[t]
      }
      const src = d.sources
      if (src) {
        row['src:web'] = src.web
        row['src:addon'] = src.addon
        row['src:other'] = src.other === null ? null : src.other + (src.selfref || 0)
      }
      row['dl:total'] = downloadTypes.reduce((sum, t) => sum + (d.dltrack[t] || 0), 0) || null
      return row
    })

  const dataTypes = {
    bytes: {
      label: 'Bandwidth',
      tooltip: 'The number of gigabytes downloaded from the site.',
      scale: 'linear',
      color: 'rgb(243, 130, 55)',
      formatter: (value) => `${Math.round(value / 1024 / 1024 / 1024)} GB`,
      axis: (value) => filesize(value, { round: 0 }),
    },
    requests: {
      label: 'Requests',
      tooltip: 'Total HTTP requests.',
      scale: 'linear',
      color: 'rgb(65, 187, 217)',
      formatter: (value) => Math.round(value),
    },
    requestsPerUser: {
      label: 'Requests per User',
      tooltip: 'Average HTTP requests per user.',
      scale: 'linear',
      color: 'rgb(65, 187, 217)',
      formatter: (value) => Math.round(value),
    },
    bytesPerUser: {
      label: 'Bandwidth per User',
      tooltip: 'The number of megabytes downloaded per user.',
      scale: 'linear',
      color: 'rgb(243, 130, 55)',
      formatter: (value) => `${Math.round(value / 1024 / 1024)} MB`,
      axis: (value) => filesize(value, { round: 0 }),
    },
    assetsPublished: {
      label: 'Assets Published',
      tooltip: 'The number of assets live on this day.',
      scale: 'linear',
      color: 'rgb(161, 208, 77)',
      formatter: (value) => Math.round(value),
    },
    usersPerAsset: {
      label: 'Users per Asset',
      tooltip: 'The number of unique users per assets live on this day.',
      scale: 'linear',
      color: 'rgb(161, 208, 77)',
      formatter: (value) => Math.round(value),
    },
    threats: {
      label: 'Threats',
      tooltip: '(Log scale) Requests that Cloudflare determines are coming from spam bots or malicious sources.',
      scale: 'log',
      color: 'rgb(249, 104, 84)',
      formatter: (value) => Math.round(value),
    },
    pageViews: {
      label: (
        <>
          CF "Page Views" <MdWarning />
        </>
      ),
      tooltip:
        'Our site is a single-page-application, so Cloudflare is very inconsistent about what it counts as a "page view". Take this graph with a billion grains of salt and rather don\'t try to make any sense of it.',
      scale: 'linear',
      color: 'rgb(242, 191, 56)',
      formatter: (value) => Math.round(value),
    },
    uniques: {
      label: (
        <>
          Unique Users <MdWarning />
        </>
      ),
      tooltip:
        "The number of users visiting the whole site. As with page views, Cloudflare seems to get confused about this, so it's not very reliable.",
      scale: 'linear',
      color: 'rgb(190, 111, 255)',
      formatter: (value) => Math.round(value),
    },
  }
  if (downloadsData.length) {
    dataTypes['downloads'] = {
      label: 'CF Downloads',
      tooltip:
        'Asset downloads tracked on the server side by Cloudflare, from all sources: the website, the Blender add-on, scripts and other tools (solid lines). Compared to standard downloads from the website (dashed lines).',
      scale: 'linear',
      formatter: (value) => Math.round(value).toLocaleString(),
    }
    dataTypes['sources'] = {
      label: 'Download Sources',
      tooltip:
        'Asset downloads tracked on the server side by Cloudflare, stacked by where they came from: the website, our Blender add-on, and everything else (scripts, pipelines, mirrors, direct links). The dashed line is standard downloads from the website, for comparison with the website band.',
      scale: 'linear',
      formatter: (value) => Math.round(value).toLocaleString(),
    }
  }
  const isSources = dataType === 'sources'
  const isDownloads = dataType === 'downloads' || isSources

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Website traffic in the last year:</p>
        <Dropdown value={dataType} options={dataTypes} onChange={setdataType} label="Data" />
      </div>
      <div className={styles.bigGraph}>
        <ResponsiveContainer>
          <ComposedChart data={isDownloads ? downloadsData : graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" />
            <YAxis
              scale={dataTypes[dataType].scale}
              domain={[dataType === 'assetsPublished' ? 'auto' : dataTypes[dataType].scale === 'log' ? 1 : 0, 'auto']}
              allowDataOverflow
              // Raw counts here run to 14 digits (bandwidth in bytes) and overflow the axis.
              tickFormatter={(value) => (dataTypes[dataType].axis || ((v) => formatNumber(v, 1)))(value)}
            />
            <Brush dataKey="day" height={30} stroke="#666666" fill="#2d2d2d" />

            <Tooltip
              label="day"
              contentStyle={{
                backgroundColor: 'rgba(30,30,30,0.3)',
                padding: '0.5em',
              }}
              itemStyle={{
                padding: 0,
                margin: '-0.3em',
                fontSize: '0.8em',
              }}
              labelStyle={{
                textAlign: 'center',
                marginTop: '-0.5em',
              }}
              formatter={(value, name) =>
                isDownloads
                  ? [dataTypes[dataType].formatter(value), name]
                  : [
                      dataTypes[dataType].formatter(value),
                      String(name).startsWith('s:') ? 'Smoothed' : dataTypes[dataType].label,
                    ]
              }
            />

            {isSources &&
              downloadSources.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={`src:${s.key}`}
                  name={s.name}
                  stackId="sources"
                  stroke={s.color}
                  fill={s.color}
                  fillOpacity={0.6}
                  animationDuration={500}
                />
              ))}
            {isSources && (
              <Line
                type="monotone"
                dataKey="dl:total"
                name="Website (dlTrack)"
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                animationDuration={500}
                dot={false}
              />
            )}

            {dataType === 'downloads' &&
              downloadTypes.map((t) => [
                <Line
                  key={t}
                  type="monotone"
                  dataKey={t}
                  name={`${typeNames[t]}s (Cloudflare)`}
                  stroke={typeColors[t]}
                  strokeWidth={2}
                  animationDuration={500}
                  dot={false}
                />,
                <Line
                  key={`dl:${t}`}
                  type="monotone"
                  dataKey={`dl:${t}`}
                  name={`${typeNames[t]}s (website)`}
                  stroke={typeColors[t]}
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  animationDuration={500}
                  dot={false}
                />,
              ])}

            {!isDownloads && (
              <Line
                type="monotone"
                dataKey={dataType}
                stroke={dataTypes[dataType].color}
                strokeWidth={1.5}
                animationDuration={500}
                dot={false}
                opacity={0.5}
              />
            )}
            {!isDownloads && (
              <Line
                type="monotone"
                dataKey={`s:${dataType}`}
                stroke={dataTypes[dataType].color}
                strokeWidth={3}
                animationDuration={500}
                dot={false}
              />
            )}

            {Object.keys(notes).map((d, i) => (
              <ReferenceLine
                key={i}
                x={d}
                stroke="rgba(255, 70, 70, 0.75)"
                label={<Label value={i + 1} position="insideTopLeft" fill="rgba(255, 70, 70, 0.75)" />}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {Object.keys(notes).length > 0 ? (
        <>
          <p style={{ marginBottom: 0 }}>Notes:</p>
          <ol className={styles.notesList}>
            {Object.keys(notes).map((d, i) => (
              <li key={i}>
                <strong>{d}</strong>: <span>{notes[d]}</span>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  )
}

export default TrafficGraph
