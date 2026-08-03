import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts'

import Dropdown from 'components/UI/Dropdown/Dropdown'
import { seriesColors, barColor, otherColor, tooltipStyles } from './chartColors'
import { axisWidthFor } from './labelWidth'

import styles from './Stats.module.scss'

/**
 * What the people using our assets actually make things with, from the software field on gallery
 * submissions - roughly 1,700 artworks going back to 2018.
 *
 * Two views of the same slice. "Over time" is the interesting one: it is the only place on the site
 * that shows the shift in our audience's tools, and Blender overtaking 3ds Max in 2022 is plainly
 * visible in it. "All time" is the flat leaderboard, for the smaller categories where a handful of
 * artworks a year makes a trend meaningless.
 *
 * Both views are relative, in the same sense as the relative-demand graph: every number is a share
 * of the times something in that category was named, so a year adds up to 100% and the chart shows
 * how the mix moved rather than how many artworks happened to come in. An artwork naming Blender
 * and 3ds Max contributes to both, so the whole being divided up is mentions and not artworks - the
 * tooltip carries the underlying artwork counts, which is where the absolute numbers live.
 *
 * Only the category is split by colour, never the whole library: someone who wrote "Photoshop" and
 * nothing else says nothing about which 3D app they use, and rolling every category into one chart
 * would put those two in the same pie. Everything past the sixth product in a category folds into
 * "Other" rather than getting a colour of its own, so the bands stay tellable apart.
 */

interface Bucket {
  assessed: number
  counts: Record<string, number>
}

interface Period {
  period: string
  artworks: number
  partial: boolean
  categories: Record<string, Bucket>
}

interface Software {
  label: string
  category: string
  count: number
  share: number
}

interface SoftwareData {
  meta: { artworks: number; recognised: number; first: string; last: string }
  categories: Record<string, { label: string; noun: string; assessed: number }>
  software: Record<string, Software>
  timeline: Period[]
}

// A year that thin is a handful of people, not a trend, and plotting it produces swings of tens of
// percent from two artworks changing their minds.
const MIN_PERIOD = 15
// The palette is a fixed set of hues and stops there rather than generating more; the rest is Other.
const MAX_SERIES = 6
// Enough to show the long tail of a category without the bars becoming unreadable slivers.
const MAX_BARS = 12

const OTHER = '__other'

const SoftwarePopularity = ({ data }: { data: SoftwareData }) => {
  const [category, setCategory] = useState('dcc')
  const [view, setView] = useState('time')

  const categories = data?.categories || {}
  const allSoftware = data?.software || {}
  const key = categories[category] ? category : Object.keys(categories)[0]
  const cat = categories[key]

  // Only reachable if the stats fetch failed at build time.
  if (!cat) {
    return (
      <div>
        <div className={styles.graphHeader}>
          <p>Software used in gallery artworks:</p>
        </div>
        <div className={`${styles.medGraph} ${styles.graphEmpty}`}>No data.</div>
      </div>
    )
  }

  // Already sorted by count in the payload, so this is the category's leaderboard order - and the
  // order the palette is assigned in, so a colour stays with a product for as long as the chart is
  // showing that category.
  const ranked = Object.entries(allSoftware)
    .filter(([, s]) => s.category === key)
    .map(([id, s]) => ({ id, ...s }))

  const series = ranked.slice(0, MAX_SERIES)
  const colorOf = (id: string) =>
    id === OTHER ? otherColor : seriesColors[series.findIndex((s) => s.id === id) % seriesColors.length]

  const periods = (data?.timeline || [])
    .filter((p) => (p.categories[key]?.assessed || 0) >= MIN_PERIOD)
    .map((p) => {
      const bucket = p.categories[key]
      // The whole being divided up is every mention in the category that year, including the
      // products too small to get a band of their own - otherwise the six named ones would
      // normalise among themselves and Other would have nothing left to be.
      const total = Object.values(bucket.counts).reduce((a, b) => a + b, 0)
      const counts: Record<string, number> = {}
      const row: Record<string, any> = { period: p.period, assessed: bucket.assessed, partial: p.partial, counts }

      let named = 0
      for (const s of series) {
        const n = bucket.counts[s.id] || 0
        named += n
        counts[s.id] = n
        row[s.id] = total ? (n / total) * 100 : 0
      }
      counts[OTHER] = total - named
      row[OTHER] = total ? ((total - named) / total) * 100 : 0
      return row
    })

  // A category with six products or fewer has no remainder, and an Other band pinned at zero is
  // just a legend entry that means nothing.
  const hasOther = periods.some((p) => p.counts[OTHER] > 0)
  const bands = hasOther ? [...series, { id: OTHER, label: 'Other' }] : series

  const mentions = ranked.reduce((a, s) => a + s.count, 0)
  const bars = ranked.slice(0, MAX_BARS).map((s) => ({ ...s, percent: mentions ? (s.count / mentions) * 100 : 0 }))

  const categoryOptions = Object.fromEntries(
    Object.entries(categories)
      .sort((a, b) => b[1].assessed - a[1].assessed)
      .map(([id, c]) => [id, { label: c.label }])
  )
  const viewOptions = { time: { label: 'Over time' }, total: { label: 'All time' } }

  // Fewer than three points is not a trend, so a category too thin only offers the totals.
  const canTrend = periods.length >= 3
  const showing = canTrend ? view : 'total'

  const TimeTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0].payload
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>
          {label}
          {row.partial ? ' (so far)' : ''}
        </div>
        {/* Biggest first, rather than in stacking order - the question a tooltip answers is which
            one is winning this year. */}
        {[...payload]
          .sort((a: any, b: any) => b.value - a.value)
          .map((p: any) => (
            <div key={p.dataKey} style={{ ...tooltipStyles.itemStyle, color: p.color }}>
              {p.name}: {p.value.toFixed(0)}% ({row.counts[p.dataKey]})
            </div>
          ))}
        <div style={{ ...tooltipStyles.itemStyle, opacity: 0.6, marginTop: '0.3em' }}>
          {row.assessed} artwork{row.assessed === 1 ? '' : 's'}
        </div>
      </div>
    )
  }

  const BarTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0].payload
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>{row.label}</div>
        <div style={tooltipStyles.itemStyle}>
          {row.percent.toFixed(1)}% - named by {row.count} artwork{row.count === 1 ? '' : 's'}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.graphHeader}>
        <p>Software used in gallery artworks:</p>
        <div className={styles.chartControls}>
          <Dropdown value={key} options={categoryOptions} onChange={setCategory} mini align="left" />
          {canTrend ? <Dropdown value={showing} options={viewOptions} onChange={setView} mini align="left" /> : null}
        </div>
      </div>

      <div className={styles.medGraph}>
        <ResponsiveContainer>
          {showing === 'time' ? (
            // Stacked and normalised, laid out like the relative-demand graph: no y-axis, since
            // every column is a full 100% and the numbers that matter are in the tooltip.
            //
            // The side margins are half a year label wide. Without them the plot runs to the very
            // edge, and recharts silently drops the first and last tick rather than let their
            // labels overhang - losing 2018 and 2026, the two years the whole chart is about.
            <AreaChart data={periods} margin={{ top: 8, right: 18, bottom: 0, left: 18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
              <XAxis dataKey="period" tick={{ fontSize: '0.75em' }} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<TimeTooltip />} />
              {/* Software names carry no colour of their own the way the asset types do, so unlike
                  the relative-demand graph this one cannot go without a legend. */}
              <Legend wrapperStyle={{ fontSize: '0.75em' }} iconType="square" iconSize={9} />
              {/* Declared biggest-first so the largest band sits on the baseline and Other rides on
                  top, where a remainder belongs. */}
              {bands.map((b) => (
                <Area
                  key={b.id}
                  type="monotone"
                  dataKey={b.id}
                  name={b.label}
                  stackId="1"
                  stroke={colorOf(b.id)}
                  strokeWidth={0.5}
                  fill={colorOf(b.id)}
                  fillOpacity={0.75}
                  // Unanimated, like the other charts here: recharts draws the reveal on a rAF loop
                  // that does not run in a background tab, so a stats page opened in a new tab would
                  // render blank until something forced a re-render.
                  isAnimationActive={false}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={bars} layout="vertical" margin={{ top: 4, right: 40, bottom: 0, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" horizontal={false} />
              <XAxis type="number" unit="%" tick={{ fontSize: '0.75em' }} />
              <YAxis
                type="category"
                dataKey="label"
                width={axisWidthFor(
                  bars.map((b) => b.label),
                  0.72
                )}
                tick={{ fontSize: '0.72em' }}
                interval={0}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
              {/* One series, so no legend and no colour coding - the axis names every bar, and the
                  value sits on the end of it rather than being read off the axis. */}
              <Bar dataKey="percent" fill={barColor} radius={[0, 4, 4, 0]} isAnimationActive={false}>
                <LabelList
                  dataKey="percent"
                  position="right"
                  formatter={(v: number) => `${v.toFixed(0)}%`}
                  style={{ fontSize: '0.72em', fill: 'rgba(255,255,255,0.7)' }}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SoftwarePopularity
