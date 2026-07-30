import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

import Dropdown from 'components/UI/Dropdown/Dropdown'
import { typeColors, typeNames, demandColor, tooltipStyles } from './chartColors'

import styles from './Stats.module.scss'

/**
 * One configurable chart covering every attribute of every asset type, rather than a fixed chart
 * per attribute - there are nineteen of them, and most are only interesting occasionally.
 *
 * Bars are how many assets carry each value (supply, left axis) and the line is what the average
 * one is downloaded per day (demand, right axis). A short bar under a high line is a value we
 * under-serve. The axes are coloured to match their series instead of carrying a legend, which
 * would cost more height than the chart can spare.
 *
 * Buckets mirror what the library can actually filter for, so booleans show both sides (an absent
 * flag means false) and the empty side of a multi-value attribute gets its own bucket. Enums only
 * report assets that were assessed, and the caption says how much of the type that covers.
 */

interface Bucket {
  count: number
  avg: number
}

interface AttributeStat {
  type: string
  enum: string[] | null
  assessed: number
  values: Record<string, Bucket>
}

const titleCase = (s: string) =>
  s
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const AttributePopularity = ({
  data,
  totals,
}: {
  data: Record<string, Record<string, AttributeStat>>
  totals: Record<string, number>
}) => {
  const { t } = useTranslation('library')
  const [assetType, setAssetType] = useState('hdris')
  const [attribute, setAttribute] = useState('time_of_day')

  const attributes = data?.[assetType] || {}
  // Attributes differ per type, so switching type falls back to that type's first attribute rather
  // than rendering nothing until the second dropdown is touched too.
  const key = attributes[attribute] ? attribute : Object.keys(attributes)[0]
  const stat = attributes[key]

  const attrLabel = (k: string) => String(t(`attr.${k}`, { defaultValue: titleCase(k) }))

  const valueLabel = (value: string) => {
    if (stat?.type === 'boolean') return value === 'true' ? 'Yes' : 'No'
    // The empty side of a multi-value attribute. For condition that is a real state of the asset,
    // for everything else it just means nobody has filled it in.
    if (value === 'none') return key === 'condition' ? String(t('attrValue.pristine', { defaultValue: 'Pristine' })) : 'Unspecified'
    return String(t(`attrValue.${value}`, { defaultValue: titleCase(value) }))
  }

  const rows = Object.entries(stat?.values || {})
    .map(([value, bucket]) => ({ value, label: valueLabel(value), count: bucket.count, avg: bucket.avg }))
    .sort((a, b) => b.count - a.count)

  const typeOptions = Object.fromEntries(
    Object.keys(typeNames).map((k) => [k, { label: `${typeNames[k]}s` }])
  )
  const attributeOptions = Object.fromEntries(
    Object.keys(attributes).map((k) => [k, { label: attrLabel(k) }])
  )

  const total = totals?.[assetType] || 0
  const partial = stat && stat.assessed < total

  const TooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const row = payload[0].payload
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>{row.label}</div>
        <div style={{ ...tooltipStyles.itemStyle, color: typeColors[assetType] }}>
          {row.count} asset{row.count === 1 ? '' : 's'}
        </div>
        <div style={{ ...tooltipStyles.itemStyle, color: demandColor }}>
          {Math.round(row.avg)} downloads/day each
        </div>
      </div>
    )
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Popularity of attributes:</p>
        <div className={styles.chartControls}>
          <Dropdown value={assetType} options={typeOptions} onChange={setAssetType} mini align="left" />
          <Dropdown value={key} options={attributeOptions} onChange={setAttribute} mini align="left" />
        </div>
      </div>
      <div className={styles.medGraph}>
        <ResponsiveContainer>
          <ComposedChart data={rows} margin={{ top: 8, right: -8, bottom: 0, left: -22 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            {/* Angled, because material runs to seventeen values and "Partly Cloudy" will not fit
                in a band however wide the column gets. The height has to cover the rotated text or
                recharts silently clips it. */}
            <XAxis
              dataKey="label"
              interval={0}
              angle={-35}
              textAnchor="end"
              height={48}
              tick={{ fontSize: '0.7em' }}
            />
            <YAxis yAxisId="count" tick={{ fontSize: '0.75em', fill: typeColors[assetType] }} />
            <YAxis
              yAxisId="avg"
              orientation="right"
              tick={{ fontSize: '0.75em', fill: demandColor }}
              domain={[0, 'auto']}
            />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(255,255,255,0.06)' }} />
            {/* Unanimated, like the line. Recharts grows bars in from zero height on a rAF loop,
                which does not run while the tab is in the background - so a stats page opened in a
                new tab renders its bars frozen a couple of pixels tall under an axis reading 340,
                and only corrects itself on the next re-render. */}
            <Bar
              yAxisId="count"
              dataKey="count"
              fill={typeColors[assetType]}
              opacity={0.75}
              maxBarSize={44}
              isAnimationActive={false}
            />
            {/* Dots, not a line. The bars are ordered by count, so joining the averages up drew a
                zig-zag that read as a trend across values that have no order to trend along. */}
            <Line
              yAxisId="avg"
              dataKey="avg"
              stroke="none"
              dot={{ r: 4, fill: demandColor, strokeWidth: 0 }}
              activeDot={{ r: 5.5, fill: demandColor, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p className={styles.graphCaption}>
        <span style={{ color: typeColors[assetType] }}>Bars</span>: assets with each value.{' '}
        <span style={{ color: demandColor }}>Dots</span>: average downloads per day.
        {partial ? ` Set on ${stat.assessed} of ${total} ${typeNames[assetType].toLowerCase()}s.` : ''}
      </p>
    </div>
  )
}

export default AttributePopularity
