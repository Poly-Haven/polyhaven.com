import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts'

import styles from './Stats.module.scss'

const CustomizedShape = (props) => {
  const { cx, cy, fill, stroke, payload } = props
  return (
    <g>
      <a href={`/${payload.type}/${payload.cat}`}>
        <Dot cx={cx} cy={cy} r={5} fill={fill} stroke={stroke} />
      </a>
    </g>
  )
}

interface DataSet {
  hdris: { string: { count: number; avg: number } }
  textures: { string: { count: number; avg: number } }
  models: { string: { count: number; avg: number } }
}

const RelativeCat = ({ data, type, name }: { data: DataSet; type: string; name: string }) => {
  const colors = {
    hdris: 'rgb(65, 187, 217)',
    textures: 'rgb(243, 130, 55)',
    models: 'rgb(161, 208, 77)',
  }
  const colorsTransp = {
    hdris: 'rgba(65, 187, 217, 0.2)',
    textures: 'rgba(243, 130, 55, 0.2)',
    models: 'rgba(161, 208, 77, 0.2)',
  }

  let maxX = 0
  let maxY = 0
  let minY = 999999999999
  const graphData = Object.entries(data[type]).map((x) => {
    maxX = Math.max(maxX, x[1]['count'])
    maxY = Math.max(maxY, x[1]['avg'])
    minY = Math.min(minY, x[1]['avg'])
    // @ts-ignore ...x[1] Spread types may only be created from object types.
    return { ...x[1], cat: x[0], type: type }
  })

  const arrayRange = (start, stop, step) => {
    step = step || 1
    return Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step)
  }

  const roundToNearestMultipleOfTen = (num) => Math.round(num / 10) * 10
  const floorToNearestMultipleOfTen = (num) => Math.floor(num / 10) * 10

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Popularity of {name} categories:</p>
      </div>
      <div className={styles.medGraph}>
        <ResponsiveContainer>
          <ScatterChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis
              type="number"
              dataKey="count"
              name="Published assets"
              scale="sqrt"
              ticks={arrayRange(0, maxX, roundToNearestMultipleOfTen(Math.floor(maxX / 5)))}
            />
            <YAxis type="number" dataKey="avg" name="Avg downloads/day" />
            <ZAxis dataKey="cat" name="Category" />

            <Tooltip
              formatter={(value, name) => Math.round(Number(value)) || value}
              contentStyle={{
                backgroundColor: 'rgba(30,30,30,0.3)',
                padding: '0.5em',
              }}
              itemStyle={{
                padding: 0,
                margin: '-0.3em',
                fontSize: '0.8em',
                color: 'rgba(255,255,255,0.8)',
              }}
              labelStyle={{
                display: 'none',
              }}
            />
            <Scatter data={graphData} fill={colorsTransp[type]} stroke={colors[type]} shape={<CustomizedShape />} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default RelativeCat
