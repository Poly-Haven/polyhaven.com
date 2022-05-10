import { useState } from 'react';
import { AreaChart, Area, ReferenceLine, Brush, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';

import { MdStackedLineChart, MdShowChart } from 'react-icons/md'

import Switch from 'components/UI/Switch/Switch';

import styles from './Stats.module.scss'

interface Day {
  downloads: number,
  unique: number,
  day: string,
  slug: string,
  type: string,
}

interface DataSet {
  hdris: Day[],
  textures: Day[],
  models: Day[],
}

interface DayStats {
  string: {
    hdris: number,
    textures: number,
    models: number,
    total: number,
  }
}

const LastThreeMonths = ({ data }: { data: DataSet }) => {
  const [stack, setStack] = useState(true)

  const colors = {
    hdris: 'rgb(65, 187, 217)',
    textures: 'rgb(243, 130, 55)',
    models: 'rgb(161, 208, 77)',
  }

  const areas = Object.keys(colors)
  let graphData = []
  let days: Partial<DayStats> = {}
  for (const [type, stats] of Object.entries(data)) {
    for (const day of stats) {
      const v = day.unique
      days[day.day] = days[day.day] || { hdris: 0, textures: 0, models: 0, total: 0 }
      days[day.day][type] = v
      days[day.day].total += v
    }
  }
  let rollingAverage = Array(7).fill(0) // 7 day rolling average
  const average = (array) => Math.round(array.reduce((a, b) => a + b) / array.length);
  for (const stats of Object.values(days)) {
    rollingAverage.shift()
    rollingAverage.push(stats.total)
    stats['7d average total'] = average(JSON.parse(JSON.stringify(rollingAverage)))
  }
  let i = 0;
  for (const [day, stats] of Object.entries(days)) {
    i++;
    if (i < 7) continue // Remove first week since the rolling average isn't complete yet.
    graphData.push({
      day: day,
      ...stats
    })
  }

  const all_notes = {
    "2021-06-15": "Launch of polyhaven.com.",
    "2021-07-13": "texturehaven.com and 3dmodelhaven.com redirected to polyhaven.com.",
    "2021-07-19": `hdrihaven.com redirected to polyhaven.com. Any HDRI downloads before this date were tracked from the old site, using the new site's API.`,
    "2021-10-28": `API downtime causing inconsistent download tracking for the next week.`,
    "2022-05-08": `API downtime causing incomplete download tracking.`,
  }
  // Remove notes not in displayed date range
  const notes = {}
  for (const [d, n] of Object.entries(all_notes)) {
    if (Object.keys(days).includes(d)) {
      notes[d] = n
    }
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Unique downloads per day for the last 3 months:</p>
        <Switch
          on={stack}
          onClick={_ => { setStack(!stack) }}
          labelOff={<MdShowChart />}
          labelOn={<MdStackedLineChart />}
        />
      </div>
      <div className={styles.bigGraph}>
        <ResponsiveContainer>
          <AreaChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" />
            <YAxis />
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
              itemSorter={item => areas.slice().reverse().indexOf(item.name.toString())} // Reversed areas without mutating.
            />

            <Area type="monotone" dataKey="7d average total" stroke="rgb(190, 111, 255)" strokeWidth={1.5} fill="transparent" animationDuration={500} />
            {areas.map((a, i) => <Area key={a} type="monotone" dataKey={a} stackId={stack ? '1' : i} stroke={colors[a]} fill={colors[a]} fillOpacity={stack ? 0.75 : 0} animationDuration={500} strokeWidth={stack ? 0.5 : 3} />)}

            {Object.keys(notes).map((d, i) => <ReferenceLine key={i} x={d} stroke="rgba(255, 70, 70, 0.75)" label={<Label value={i + 1} position="insideTopLeft" fill="rgba(255, 70, 70, 0.75)" />} />)}
          </AreaChart>
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

export default LastThreeMonths
