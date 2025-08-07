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

const ResolutionComparison = ({ data, type }) => {
  const colors = {
    hdris: 'rgb(65, 187, 217)',
    textures: 'rgb(243, 130, 55)',
    models: 'rgb(161, 208, 77)',
  }

  let graphData = []
  for (const [res, count] of Object.entries(data)) {
    if ((count as number) > 0.01) {
      // Only include significant resolutions
      graphData.push({
        res: res,
        value: count,
      })
    }
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.smallGraph}>
        <ResponsiveContainer>
          <BarChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="res" />
            <YAxis hide />

            <Tooltip
              label="res"
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
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
            />

            <Bar type="monotone" dataKey="value" stroke={colors[type]} fill={colors[type]} animationDuration={0} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ResolutionComparison
