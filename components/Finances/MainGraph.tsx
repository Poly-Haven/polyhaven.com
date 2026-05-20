import { useState, useEffect, useRef, useMemo } from 'react'
import { AreaChart, Area, Brush, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getCurrency, catColor, operatingCostTypes, calcEmergencyFund } from 'utils/finances'
import { sortObjByValue } from 'utils/arrayUtils'
import { titleCase } from 'utils/stringUtils'

import { FiArrowDownLeft, FiArrowUpRight, FiArrowRight } from 'react-icons/fi'
import { MdStackedLineChart, MdShowChart } from 'react-icons/md'

import Dropdown from 'components/UI/Dropdown/Dropdown'
import Spinner from 'components/UI/Spinner/Spinner'
import Switch from 'components/UI/Switch/Switch'

import styles from './Finances.module.scss'

const MainGraph = ({ data, currency, startingBalance, filter, mode, setMode, monthState, setMonth }) => {
  const [stack, setStack] = useState(true)

  const { areas, colors, graphData } = useMemo(() => {
    if (!data) return { areas: {}, colors: {}, graphData: [] }

    let areas = {}
    let colors = {}
    let graphData = []
    if (['income', 'expense'].includes(mode)) {
      for (const [month, v] of Object.entries(data)) {
        let values = {}
        v['rates']['ZAR'] = 1
        for (const k of Object.keys(v[mode])) {
          if (filter.length && !filter.includes(k)) continue
          values[k] = v[mode][k] / v['rates'][currency]
        }
        graphData.push({ name: month, ...values })
        for (const cat of Object.keys(values)) {
          areas[cat] = (areas[cat] || 0) + values[cat]
          colors[cat] = catColor(cat)
        }
      }
    } else if (mode === 'balance') {
      let balance = startingBalance // ZAR
      const initialBalanceInCurrency = startingBalance / Object.values(data)[0]['rates'][currency]
      graphData.push({ name: '2020-10', Balance: initialBalanceInCurrency, 'Usable Funds': initialBalanceInCurrency })
      for (const [month, v] of Object.entries(data)) {
        v['rates']['ZAR'] = 1
        for (const k of Object.keys(v['income'])) {
          balance += v['income'][k]
        }
        for (const k of Object.keys(v['expense'])) {
          balance -= v['expense'][k]
        }
        const emergencyFundZAR = calcEmergencyFund(data, month)
        const balanceInCurrency = balance / v['rates'][currency]
        graphData.push({
          name: month,
          Balance: balanceInCurrency,
          'Usable Funds': balanceInCurrency - emergencyFundZAR / v['rates'][currency],
        })
        areas['Balance'] = (areas['Balance'] || 0) + balanceInCurrency
        colors['Balance'] = catColor('Balance')
      }
    }

    const sortedAreas = sortObjByValue(areas)

    // Fill missing values
    for (const month of graphData) {
      for (const area of Object.keys(sortedAreas)) {
        if (month[area] === undefined) {
          month[area] = 0
        }
      }
    }

    return { areas: sortedAreas, colors, graphData }
  }, [data, mode, filter, currency, startingBalance])

  const brushRangeRef = useRef({ startDate: '', endDate: '' })
  const [brushDateRange, setBrushDateRange] = useState({ startDate: '', endDate: '' })
  const brushInitializedRef = useRef(false)

  // Initialize brush date range once when data first becomes available
  useEffect(() => {
    if (!graphData.length || brushInitializedRef.current) return
    brushInitializedRef.current = true
    const startDate = graphData[Math.max(0, graphData.length - 12)]?.name ?? ''
    const endDate = graphData[graphData.length - 1]?.name ?? ''
    brushRangeRef.current = { startDate, endDate }
    setBrushDateRange({ startDate, endDate })
  }, [graphData.length])

  useEffect(() => {
    const handlePointerUp = () => {
      setBrushDateRange({ ...brushRangeRef.current })
    }
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchend', handlePointerUp)
    return () => {
      window.removeEventListener('mouseup', handlePointerUp)
      window.removeEventListener('touchend', handlePointerUp)
    }
  }, [])

  if (!data) return <Spinner />

  const findDateIndex = (date: string, fallback: number) => {
    if (!date || !graphData.length) return fallback
    const idx = graphData.findIndex((d) => d.name === date)
    if (idx >= 0) return idx
    // Find nearest date - entries are sorted 'YYYY-MM' strings
    const ceilIdx = graphData.findIndex((d) => d.name > date)
    if (ceilIdx === -1) return graphData.length - 1
    if (ceilIdx === 0) return 0
    const toMonths = (s: string) => parseInt(s.slice(0, 4)) * 12 + parseInt(s.slice(5, 7))
    const floorIdx = ceilIdx - 1
    const target = toMonths(date)
    return target - toMonths(graphData[floorIdx].name) <= toMonths(graphData[ceilIdx].name) - target
      ? floorIdx
      : ceilIdx
  }
  const brushStartIndex = findDateIndex(brushDateRange.startDate, Math.max(0, graphData.length - 12))
  const brushEndIndex = findDateIndex(brushDateRange.endDate, graphData.length - 1)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.graphTooltip}>
          <p className={styles.tooltipHeader}>{label}</p>
          {payload
            .filter((v) => v.value)
            .map((v, i) => {
              const name = v.name === 'Usable Funds' && v.value < 0 ? 'Savings Deficit' : v.name
              return <p key={i} style={{ color: v.color }}>{`${name}: ${getCurrency(v.value, currency, {})}`}</p>
            })}
        </div>
      )
    }

    return null
  }

  const modes = {
    income: { label: 'Income', icon: <FiArrowDownLeft /> },
    expense: { label: 'Expenses', icon: <FiArrowUpRight /> },
    balance: { label: 'Balance', icon: <FiArrowRight /> },
  }
  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <Dropdown value={mode} options={modes} onChange={setMode} />
        <h2>{titleCase(modes[mode].label)} over time:</h2>
        {mode !== 'balance' ? (
          <Switch
            on={stack}
            onClick={(_) => {
              setStack(!stack)
            }}
            labelOff={<MdShowChart />}
            labelOn={<MdStackedLineChart />}
          />
        ) : null}
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
            onClick={(data) => {
              if (data && data.activeLabel) {
                setMonth(data.activeLabel === monthState ? null : data.activeLabel)
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 'auto']} tickFormatter={(v) => `${getCurrency(v, currency, {}, false, true)}`} />
            <Brush
              dataKey="name"
              height={30}
              stroke="#666666"
              fill="#2d2d2d"
              startIndex={brushStartIndex}
              endIndex={brushEndIndex}
              onChange={({ startIndex, endIndex }) => {
                brushRangeRef.current = {
                  startDate: graphData[startIndex]?.name ?? '',
                  endDate: graphData[endIndex]?.name ?? '',
                }
              }}
            />
            <Tooltip
              // @ts-ignore complaints about missing active, payload, labelts
              content={<CustomTooltip />}
              itemStyle={{
                padding: 0,
                fontSize: '0.8em',
              }}
            />
            {Object.keys(areas).map((a, i) => (
              <Area
                key={i}
                type={mode === 'balance' || !stack ? 'monotone' : 'linear'}
                dataKey={a}
                stackId={stack ? '1' : i}
                stroke={colors[a]}
                fill={colors[a]}
                animationDuration={500}
                fillOpacity={mode === 'balance' || stack ? 0.6 : 0}
                strokeWidth={mode === 'balance' || stack ? 0 : 3}
              />
            ))}
            {mode === 'balance' && (
              <Area
                type="monotone"
                dataKey="Usable Funds"
                stackId="usable-funds"
                stroke="rgba(255,255,255,0.35)"
                strokeDasharray="5 5"
                strokeWidth={2}
                fill="rgba(0,0,0,0)"
                fillOpacity={0}
                animationDuration={500}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default MainGraph
