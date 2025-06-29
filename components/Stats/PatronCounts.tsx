import {
  LineChart,
  Line,
  Brush,
  ReferenceLine,
  Label,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import styles from './Stats.module.scss'

interface PatronData {
  [month: string]: {
    [day: string]: number
  }
}

const PatronCounts = ({ data }: { data: PatronData }) => {
  let rawData = []

  // Transform nested monthly data into flat timeline
  for (const [month, monthData] of Object.entries(data)) {
    for (const [day, patronCount] of Object.entries(monthData)) {
      // Create proper date object from month (YYYY-MM) and day using UTC
      const [year, monthNum] = month.split('-')
      const date = new Date(Date.UTC(parseInt(year), parseInt(monthNum) - 1, parseInt(day)))

      // Only add valid dates
      if (!isNaN(date.getTime())) {
        rawData.push({
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          patrons: patronCount,
          timestamp: date.getTime(),
        })
      }
    }
  }

  // Sort by timestamp
  rawData.sort((a, b) => a.timestamp - b.timestamp)

  // Create complete date range with null values for missing dates
  let graphData = []
  if (rawData.length > 0) {
    const startDate = new Date(rawData[0].timestamp)
    const endDate = new Date(rawData[rawData.length - 1].timestamp)
    const dataMap = new Map(rawData.map((item) => [item.date, item.patrons]))

    for (let d = new Date(startDate); d <= endDate; d.setUTCDate(d.getUTCDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      graphData.push({
        date: dateStr,
        patrons: dataMap.get(dateStr) || null,
      })
    }
  }

  const notes = {
    '2017-10-03': 'HDRI Haven Launch',
    '2018-06-19': 'Texture Haven Launch',
    '2020-03-31': 'Model Haven Launch',
    '2021-06-15': 'Poly Haven Launch',
    '2022-08-24': 'Blender Add-on Released',
    '2025-03-03': 'Ads Removed',
    '2025-06-10': 'Vaults Introduced',
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>
          <a href="https://www.patreon.com/polyhaven/overview">Patreon</a> supporters over time:
        </p>
      </div>
      <div className={styles.bigGraph}>
        <ResponsiveContainer>
          <LineChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value + 'T00:00:00Z')
                return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit', timeZone: 'UTC' })
              }}
            />
            <YAxis domain={['dataMin - 1', 'dataMax']} allowDataOverflow />
            <Brush dataKey="date" height={30} stroke="#666666" fill="#2d2d2d" startIndex={graphData.length - 365} />

            <Tooltip
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
              formatter={(value, name) => [value, 'Patrons']}
              labelFormatter={(label) => {
                const date = new Date(label + 'T00:00:00Z')
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })
              }}
            />

            <Line
              type="monotone"
              dataKey="patrons"
              stroke="rgb(249, 104, 84)"
              strokeWidth={3}
              animationDuration={500}
              dot={false}
              connectNulls={true}
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

export default PatronCounts
