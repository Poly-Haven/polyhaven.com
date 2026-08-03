import { useState } from 'react'
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts'

import Dropdown from 'components/UI/Dropdown/Dropdown'
import { seriesColors, tooltipStyles } from './chartColors'
import { axisWidthFor } from './labelWidth'

import styles from './Stats.module.scss'

/**
 * What each piece of software gets used alongside, from artworks that named more than one.
 *
 * The pairing is the part nobody publishes: 3ds Max users overwhelmingly render in Corona and V-Ray,
 * Blender users in Cycles, and picking through the list shows which renderer owns which host app.
 * That is worth knowing when deciding which formats and shaders an asset ships with.
 *
 * Bars are coloured by the partner's category rather than per-bar, so the shape of a pipeline reads
 * off the chart at a glance - a run of one colour means "these people all named a render engine".
 * The legend only lists categories actually on screen.
 *
 * Only pairings seen twice or more survive the API, so a single artwork naming something exotic
 * cannot put a bar on this chart.
 */

interface SoftwareData {
  categories: Record<string, { label: string }>
  software: Record<string, { label: string; category: string; count: number }>
  pairs: Record<string, Record<string, number>>
}

// Below this the percentages get jumpy enough to mislead - a partner on 2 of 7 artworks is not 29%
// of anything meaningful.
const MIN_ARTWORKS = 20
const MAX_PARTNERS = 8

const SoftwarePairs = ({ data }: { data: SoftwareData }) => {
  const [selected, setSelected] = useState('blender')

  const allSoftware = data?.software || {}
  const pairs = data?.pairs || {}
  const categories = data?.categories || {}

  // Fixed order, so a category keeps its colour no matter which software is selected.
  const categoryIndex = Object.keys(categories)
  const colorOf = (category: string) => seriesColors[categoryIndex.indexOf(category) % seriesColors.length]

  const options = Object.entries(allSoftware).filter(([id, s]) => s.count >= MIN_ARTWORKS && pairs[id])
  const key = allSoftware[selected] && pairs[selected] ? selected : options[0]?.[0]
  const subject = allSoftware[key]

  // Only reachable if the stats fetch failed at build time, since the corpus always has pairings.
  if (!subject) {
    return (
      <div>
        <div className={styles.graphHeader}>
          <p>Used alongside:</p>
        </div>
        <div className={`${styles.medGraph} ${styles.graphEmpty}`}>No data.</div>
      </div>
    )
  }

  const rows = Object.entries(pairs[key] || {})
    .slice(0, MAX_PARTNERS)
    .map(([id, count]) => ({
      id,
      label: allSoftware[id]?.label || id,
      category: allSoftware[id]?.category,
      count,
      percent: (count / subject.count) * 100,
    }))

  const dropdownOptions = Object.fromEntries(options.map(([id, s]) => [id, { label: s.label }]))
  const present = categoryIndex.filter((c) => rows.some((r) => r.category === c))

  const PairTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0].payload
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>{row.label}</div>
        <div style={{ ...tooltipStyles.itemStyle, color: colorOf(row.category) }}>
          {categories[row.category]?.label}
        </div>
        <div style={tooltipStyles.itemStyle}>
          {row.count} of {subject.count} {subject.label} artworks - {row.percent.toFixed(0)}%
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.graphHeader}>
        <p>Used alongside:</p>
        <div className={styles.chartControls}>
          <Dropdown value={key} options={dropdownOptions} onChange={setSelected} mini align="left" />
        </div>
      </div>

      <div className={styles.medGraph}>
        <ResponsiveContainer>
          <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" horizontal={false} />
            <XAxis type="number" unit="%" tick={{ fontSize: '0.75em' }} />
            <YAxis
              type="category"
              dataKey="label"
              width={axisWidthFor(
                rows.map((r) => r.label),
                0.72
              )}
              tick={{ fontSize: '0.72em' }}
              interval={0}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<PairTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
            <Bar dataKey="percent" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {rows.map((row) => (
                <Cell key={row.id} fill={colorOf(row.category)} />
              ))}
              <LabelList
                dataKey="percent"
                position="right"
                formatter={(v: number) => `${v.toFixed(0)}%`}
                style={{ fontSize: '0.72em', fill: 'rgba(255,255,255,0.7)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Hand-rolled rather than recharts' <Legend>, which keys off series and would show one entry
          called "percent" - the colour here belongs to each bar's category, not to the series. */}
      <div className={styles.chartLegend}>
        {present.map((c) => (
          <span key={c}>
            <i style={{ backgroundColor: colorOf(c) }} />
            {categories[c].label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default SoftwarePairs
