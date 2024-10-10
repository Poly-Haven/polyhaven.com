import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Brush,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Label,
  ResponsiveContainer,
} from 'recharts'

import styles from './Stats.module.scss'

interface DataSet {
  string: {
    hdris: number
    textures: number
    models: number
  }
}

const AssetsPerMonth = ({ data }: { data: DataSet }) => {
  const colors = {
    hdris: 'rgb(65, 187, 217)',
    textures: 'rgb(243, 130, 55)',
    models: 'rgb(161, 208, 77)',
  }

  const areas = Object.keys(colors)
  let days = []
  const ticks = []
  let graphData = []
  for (const [day, stats] of Object.entries(data)) {
    days.push(day)
    if (day.endsWith('-01')) {
      ticks.push(day)
    }
    graphData.push({
      day: day,
      ...stats,
    })
  }

  let notes = {
    '2017-10': `hdrihaven.com launch.`,
    '2018-04': `Vault of old HDRIs unlocked.`,
    '2018-06': `texturehaven.com launch.`,
    '2020-03': `3dmodelhaven.com launch.`,
    '2021-06': `polyhaven.com launch.`,
    '2024-02': `Verdant Trail collection published.`,
    '2024-10': `Namaqualand collection published.`,
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>New assets per month:</p>
      </div>
      <div className={styles.medGraph}>
        <ResponsiveContainer>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" ticks={ticks} />
            <YAxis width={25} orientation="right" />
            <Brush dataKey="day" height={30} stroke="#666666" fill="#2d2d2d" startIndex={graphData.length - 12} />

            <Tooltip
              label="day"
              labelFormatter={(day) => (Object.keys(notes).includes(day) ? day + `\n${notes[day]}` : day)}
              labelClassName={styles.noteLabel}
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
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              itemSorter={(item) => areas.slice().reverse().indexOf(item.name.toString())} // Reversed areas without mutating.
            />

            {areas.map((a) => (
              <Bar key={a} dataKey={a} stackId="1" stroke={colors[a]} fill={colors[a]} animationDuration={0} />
            ))}

            {Object.keys(notes).map((d, i) => (
              <ReferenceLine key={i} x={d} stroke="rgba(255, 70, 70, 0.75)" />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AssetsPerMonth
