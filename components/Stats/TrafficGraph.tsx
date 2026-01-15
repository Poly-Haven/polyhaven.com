import { useState } from 'react'
import {
  LineChart,
  Line,
  ReferenceLine,
  Brush,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Label,
  ResponsiveContainer,
} from 'recharts'

import Dropdown from 'components/UI/Dropdown/Dropdown'
import { MdWarning } from 'react-icons/md'

import styles from './Stats.module.scss'

const average = (array) => array.reduce((a, b) => a + b) / array.length

interface AssetDates {
  slug: number
}

const TrafficGraph = ({ data, assetDates }: { data: any; assetDates: AssetDates }) => {
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

  const dataTypes = {
    bytes: {
      label: 'Bandwidth',
      tooltip: 'The number of gigabytes downloaded from the site.',
      scale: 'linear',
      color: 'rgb(243, 130, 55)',
      formatter: (value) => `${Math.round(value / 1024 / 1024 / 1024)} GB`,
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

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Website traffic in the last year:</p>
        <Dropdown value={dataType} options={dataTypes} onChange={setdataType} label="Data" />
      </div>
      <div className={styles.bigGraph}>
        <ResponsiveContainer>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" />
            <YAxis
              scale={dataTypes[dataType].scale}
              domain={[dataType === 'assetsPublished' ? 'auto' : dataTypes[dataType].scale === 'log' ? 1 : 0, 'auto']}
              allowDataOverflow
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
              formatter={(value, name) => [
                dataTypes[dataType].formatter(value),
                String(name).startsWith('s:') ? 'Smoothed' : dataTypes[dataType].label,
              ]}
            />

            <Line
              type="monotone"
              dataKey={dataType}
              stroke={dataTypes[dataType].color}
              strokeWidth={1.5}
              animationDuration={500}
              dot={false}
              opacity={0.5}
            />
            <Line
              type="monotone"
              dataKey={`s:${dataType}`}
              stroke={dataTypes[dataType].color}
              strokeWidth={3}
              animationDuration={500}
              dot={false}
            />

            {Object.keys(notes).map((d, i) => (
              <ReferenceLine
                key={i}
                x={d}
                stroke="rgba(255, 70, 70, 0.75)"
                label={<Label value={i + 1} position="insideTopLeft" fill="rgba(255, 70, 70, 0.75)" />}
              />
            ))}
          </LineChart>
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
