import { AreaChart, Area, ReferenceLine, Brush, XAxis, YAxis, CartesianGrid, Tooltip, Label, ResponsiveContainer } from 'recharts';

import styles from './Stats.module.scss'

interface DataSet {
  string: {
    hdris: number,
    textures: number,
    models: number,
  }
}

const RelativeType = ({ data }: { data: DataSet }) => {

  const colors = {
    hdris: 'rgb(65, 187, 217)',
    textures: 'rgb(243, 130, 55)',
    models: 'rgb(161, 208, 77)',
  }

  const areas = Object.keys(colors)
  let days = []
  let graphData = []
  for (const [day, stats] of Object.entries(data)) {
    days.push(day)
    graphData.push({
      day: day,
      ...stats
    })
  }

  let notes = {
    "2021-06-15": "Launch of polyhaven.com.",
    "2021-07-13": "texturehaven.com and 3dmodelhaven.com redirected to polyhaven.com.",
    "2021-07-19": `hdrihaven.com redirected to polyhaven.com. Any HDRI downloads before this date were tracked from the old site, using the new site's API. The spike in "unique" downloads (users) is due to the new site using consent-driven UUIDs instead of raw IP addresses.`,
  }
  // Remove notes not in displayed date range
  for (const d of Object.keys(notes)) {
    if (!days.includes(d)) {
      delete (notes[d])
    }
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Relative demand* per type.</p>
      </div>
      <div className={styles.bigGraph}>
        <ResponsiveContainer>
          <AreaChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} hide />
            <Brush dataKey="day" height={30} stroke="#666666" fill="#2d2d2d" />

            <Tooltip
              label="day"
              formatter={(value, name) => value.toFixed(1) + '%'}
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
      <p>* Demand is calculated as the number of downloads per asset of that type available. I.e. If there are 10000 downloads for HDRIs in a day, and 500 HDRIs available on that day, the demand is 10000/500 = 20.<br />If there are 2000 model downloads and 100 models available, the demand would also be 20. This provides a more useful indication of what people come to Poly Haven for.</p>
      <p>This graph is also relative, normalizing the demand of all asset types to 100%. Essentially it compares what asset types are most desired, taking into account the number of that type available, and ignoring ubiquitous daily fluctuations.</p>
    </div>
  )
}

export default RelativeType
