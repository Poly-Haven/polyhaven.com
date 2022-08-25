import { useState } from 'react';
import { AreaChart, Area, Brush, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getCurrency, catColor } from 'utils/finances';
import { sortObjByValue } from 'utils/arrayUtils'
import { titleCase } from 'utils/stringUtils';

import { FiArrowDownLeft, FiArrowUpRight, FiArrowRight } from 'react-icons/fi'
import { MdStackedLineChart, MdShowChart } from 'react-icons/md'

import Dropdown from 'components/UI/Dropdown/Dropdown';
import Spinner from 'components/UI/Spinner/Spinner'
import Switch from 'components/UI/Switch/Switch';

import styles from './Finances.module.scss'

const MainGraph = ({ data, currency, startingBalance }) => {
  const [mode, setMode] = useState('balance')
  const [stack, setStack] = useState(true)

  if (!data) return <Spinner />

  let areas = {}
  let colors = {}
  let graphData = []
  if (['income', 'expense'].includes(mode)) {
    for (const [month, v] of Object.entries(data)) {
      let values = {}
      for (const k of Object.keys(v[mode])) {
        v['rates']['ZAR'] = 1
        values[k] = v[mode][k] / v['rates'][currency]
      }
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
  } else if (mode === 'balance') {
    let balance = startingBalance / Object.values(data)[0]['rates'][currency]
    graphData.push({
      name: '2020-10',
      ...{ 'Balance': balance }
    })
    for (const [month, v] of Object.entries(data)) {
      let values = {}
      for (const k of Object.keys(v['income'])) {
        v['rates']['ZAR'] = 1
        const value = v['income'][k] / v['rates'][currency]
        balance += value
      }
      for (const k of Object.keys(v['expense'])) {
        v['rates']['ZAR'] = 1
        const value = v['expense'][k] / v['rates'][currency]
        balance -= value
      }
      values['Balance'] = balance
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

  const modes = {
    income: { label: "Income", icon: <FiArrowDownLeft /> },
    expense: { label: "Expenses", icon: <FiArrowUpRight /> },
    balance: { label: "Balance", icon: <FiArrowRight /> },
  }
  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <Dropdown
          value={mode}
          options={modes}
          onChange={setMode}
        />
        <h2>{titleCase(modes[mode].label)} over time:</h2>
        {mode !== 'balance' ?
          <Switch
            on={stack}
            onClick={_ => { setStack(!stack) }}
            labelOff={<MdShowChart />}
            labelOn={<MdStackedLineChart />}
          />
          : null}
      </div>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="name" />
            <YAxis />
            <Brush dataKey="name" height={30} stroke="#666666" fill="#2d2d2d" />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(30,30,30,0.9)' }}
              itemStyle={{
                padding: 0,
                fontSize: '0.8em'
              }}
              formatter={(value, name) => getCurrency(value, currency, {})}
            />
            {Object.keys(areas).map((a, i) => <Area key={i} type={mode === 'balance' || !stack ? "monotone" : "linear"} dataKey={a} stackId={stack ? '1' : i} stroke={colors[a]} fill={colors[a]} animationDuration={500} fillOpacity={mode === 'balance' || stack ? 0.6 : 0} strokeWidth={mode === 'balance' || stack ? 0 : 3} />)}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MainGraph
