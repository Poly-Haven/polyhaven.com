import { useState } from 'react';
import { LineChart, Line, ReferenceLine, Brush, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';

import Dropdown from 'components/UI/Dropdown/Dropdown';

import styles from './Stats.module.scss'

const average = (array) => Math.round(array.reduce((a, b) => a + b) / array.length);

const TrafficGraph = ({ data }) => {
  const [dataType, setdataType] = useState('uniques')

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
    dayData.bytesPerUser += dayData.bytes / dayData.uniques
    dayData.requestsPerUser += dayData.requests / dayData.uniques
    graphData.push(dayData)
  }

  // Smoothed data
  let i = 0;
  for (const day of graphData) {
    for (const [key, value] of Object.entries(day)) {
      if (key === 'day') continue
      const weeks = 2;
      const adjacentDays = weeks * 7 - 4;
      const smoothFac = 7
      let values = Array(smoothFac).fill(value)
      for (var j = 1; j <= adjacentDays; j++) {
        if (i - j < 0) continue
        if (i + j >= graphData.length) continue
        for (var k = 0; k < smoothFac - j; k++) {
          values.push(graphData[i - j][key])
          values.push(graphData[i + j][key])
        }
      }
      day[`s:${key}`] = average(values)
    }
    i++;
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
    uniques: {
      label: "Unique Users",
      tooltip: "The number of users visiting the whole site.",
      scale: "linear",
      color: "rgb(190, 111, 255)",
      formatter: value => value,
    },
    requests: {
      label: "Requests",
      tooltip: "Total HTTP requests.",
      scale: "linear",
      color: "rgb(65, 187, 217)",
      formatter: value => value,
    },
    requestsPerUser: {
      label: "Requests per User",
      tooltip: "Average HTTP requests per user.",
      scale: "linear",
      color: "rgb(65, 187, 217)",
      formatter: value => Math.round(value),
    },
    bytes: {
      label: "Bandwidth",
      tooltip: "The number of gigabytes downloaded from the site.",
      scale: "linear",
      color: "rgb(243, 130, 55)",
      formatter: value => `${Math.round(value / 1024 / 1024 / 1024)} GB`,
    },
    bytesPerUser: {
      label: "Bandwidth per User",
      tooltip: "The number of megabytes downloaded per user.",
      scale: "linear",
      color: "rgb(243, 130, 55)",
      formatter: value => `${Math.round(value / 1024 / 1024)} MB`,
    },
    pageViews: {
      label: "Page Views",
      tooltip: "Raw page views. As our site is a SPA, defining what is a page view is difficult. Spikes are present each time a new version of the site is deployed.",
      scale: "linear",
      color: "rgb(161, 208, 77)",
      formatter: value => value,
    },
    threats: {
      label: "Threats",
      tooltip: "(Log scale) Requests that Cloudflare determines are coming from spam bots or malicious sources.",
      scale: "log",
      color: "rgb(249, 104, 84)",
      formatter: value => value,
    },
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Website traffic in the last year:</p>
        <Dropdown
          value={dataType}
          options={dataTypes}
          onChange={setdataType}
          label="Data"
        />
      </div>
      <div className={styles.bigGraph}>
        <ResponsiveContainer>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" />
            <YAxis scale={dataTypes[dataType].scale} domain={[dataTypes[dataType].scale === 'log' ? 'auto' : 0, 'auto']} />
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
              formatter={(value, name) => [dataTypes[dataType].formatter(value), name.startsWith("s:") ? "Smoothed" : dataTypes[dataType].label]}
            />

            <Line type="monotone" dataKey={dataType} stroke={dataTypes[dataType].color} strokeWidth={1.5} animationDuration={500} dot={false} opacity={0.5} />
            <Line type="monotone" dataKey={`s:${dataType}`} stroke={dataTypes[dataType].color} strokeWidth={3} animationDuration={500} dot={false} />

            {Object.keys(notes).map((d, i) => <ReferenceLine key={i} x={d} stroke="rgba(255, 70, 70, 0.75)" label={<Label value={i + 1} position="insideTopLeft" fill="rgba(255, 70, 70, 0.75)" />} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {Object.keys(notes).length > 0 ? <>
        <p style={{ marginBottom: 0 }}>Notes:</p>
        <ol className={styles.notesList}>
          {Object.keys(notes).map((d, i) => <li key={i}><strong>{d}</strong>: <span>{notes[d]}</span></li>)}
        </ol>
      </> : null}
    </div>
  )
}

export default TrafficGraph
