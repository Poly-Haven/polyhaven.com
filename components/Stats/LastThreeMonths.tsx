import { AreaChart, Area, ReferenceLine, Brush, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';

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
  }
}

const LastThreeMonths = ({ data }: { data: DataSet }) => {

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
      days[day.day] = days[day.day] || { hdris: 0, textures: 0, models: 0 }
      days[day.day][type] = day.unique
    }
  }
  for (const [day, stats] of Object.entries(days)) {
    graphData.push({
      day: day,
      ...stats
    })
  }

  let notes = {
    "2021-06-15": "Launch of polyhaven.com.",
    "2021-07-13": "texturehaven.com and 3dmodelhaven.com redirected to polyhaven.com.",
    "2021-07-19": `hdrihaven.com redirected to polyhaven.com. Any HDRI downloads before this date were tracked from the old site, using the new site's API. The spike in "unique" downloads (users) is due to the new site using consent-driven UUIDs instead of raw IP addresses.`,
    "2021-10-28": `API downtime causing inconsistent download tracking for the next week.`,
  }
  // Remove notes not in displayed date range
  for (const d of Object.keys(notes)) {
    if (!Object.keys(days).includes(d)) {
      delete (notes[d])
    }
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Unique downloads per day for the last 3 months:</p>
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

            {areas.map(a => <Area key={a} type="monotone" dataKey={a} stackId="1" stroke={colors[a]} fill={colors[a]} animationDuration={0} />)}

            {Object.keys(notes).map((d, i) => <ReferenceLine key={i} x={d} stroke="rgba(255, 70, 70, 0.75)" label={<Label value={i + 1} position="insideTopLeft" fill="rgba(255, 70, 70, 0.75)" />} />)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p style={{ marginBottom: 0 }}>Notes:</p>
      <ol className={styles.notesList}>
        {Object.keys(notes).map((d, i) => <li key={i}><strong>{d}</strong>: <span>{notes[d]}</span></li>)}
      </ol>
    </div>
  )
}

export default LastThreeMonths
