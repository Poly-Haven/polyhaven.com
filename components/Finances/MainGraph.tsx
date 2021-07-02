import { getCurrency, catColor } from 'utils/finances';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { sortObjByValue } from 'utils/arrayUtils'

import Spinner from 'components/Spinner/Spinner'

import styles from './Finances.module.scss'

const Monthly = ({ data, currency }) => {
  if (!data) return <Spinner />

  let areas = {}
  let colors = {}
  let graphData = []
  for (const [month, v] of Object.entries(data)) {
    const values = v['income']
    graphData.push({
      name: month,
      ...values
    })
    for (const cat of Object.keys(values)) {
      areas[cat] = areas[cat] || 0
      areas[cat] = areas[cat] + values[cat]
      colors[cat] = catColor(cat)
    }
  }
  areas = sortObjByValue(areas)

  // Fill missing values
  for (const month of graphData) {
    for (const area of Object.keys(areas)) {
      if (month[area] === undefined) {
        month[area] = 0
      }
    }
  }

  // 'basis' | 'basisClosed' | 'basisOpen' | 'linear' | 'linearClosed' | 'natural' | 'monotoneX' | 'monotoneY' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter'
  return (
    <div className={styles.graphSection}>
      <h2>Income over time:</h2>
      <div className={styles.mainGraph}>
        <ResponsiveContainer>
          <AreaChart
            data={graphData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30,30,30,0.9)' }}
              itemStyle={{
                padding: 0,
                fontSize: '0.8em'
              }}
              formatter={(value, name) => getCurrency(value, currency)}
            />
            {Object.keys(areas).map((a, i) => <Area key={i} type="linear" dataKey={a} stackId="1" stroke={colors[a]} fill={colors[a]} />)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Monthly
