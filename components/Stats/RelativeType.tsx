import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MdHelp, MdStackedLineChart, MdShowChart } from 'react-icons/md'

import Switch from 'components/UI/Switch/Switch'

import styles from './Stats.module.scss'

interface DataSet {
  string: {
    hdris: number
    textures: number
    models: number
  }
}

const RelativeType = ({ data }: { data: DataSet }) => {
  const [stack, setStack] = useState(true)

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
      ...stats,
    })
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>
          Relative demand{' '}
          <MdHelp data-tip="Demand is calculated as the number of downloads per asset of that type available. I.e. If there are 10000 downloads for HDRIs in a day, and 500 HDRIs available on that day, the demand is 10000/500 = 20.<br />If there are 2000 model downloads and 100 models available, the demand would also be 20. This provides a more useful indication of what people come to Poly Haven for.<br />This graph is also relative, normalizing the demand of all asset types to 100%. Essentially it compares what asset types are most desired, taking into account the number of that type available, and ignoring ubiquitous daily fluctuations." />{' '}
          per type:
        </p>
        <Switch
          on={stack}
          onClick={(_) => {
            setStack(!stack)
          }}
          labelOff={<MdShowChart />}
          labelOn={<MdStackedLineChart />}
        />
      </div>
      <div className={styles.medGraph}>
        <ResponsiveContainer>
          <AreaChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} hide />

            <Tooltip
              label="day"
              formatter={(value, name) => Number(value).toFixed(1) + '%'}
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
              itemSorter={(item) => areas.slice().reverse().indexOf(item.name.toString())} // Reversed areas without mutating.
            />

            {areas.map((a) => (
              <Area
                key={a}
                type="monotone"
                dataKey={a}
                stackId={stack ? '1' : a}
                stroke={colors[a]}
                strokeWidth={stack ? 0.5 : 3}
                fill={colors[a]}
                fillOpacity={stack ? 0.75 : 0}
                animationDuration={500}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RelativeType
