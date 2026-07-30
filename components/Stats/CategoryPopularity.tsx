import { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot, Label } from 'recharts'
import { MdChevronRight, MdSubdirectoryArrowRight } from 'react-icons/md'

import { getRoots, nodeFromPath, ancestorsOf, TaxonomyNode } from 'utils/taxonomy'
import { typeColors, typeColorsTransp, tooltipStyles } from './chartColors'

import styles from './Stats.module.scss'

/**
 * Supply against demand for the single-path taxonomy: how many assets a category holds (X) versus
 * what the average one is downloaded per day (Y). A point up and to the left is a category people
 * want more of than we have.
 *
 * The taxonomy is ~230 nodes per type, far too many to plot at once, so the chart shows one level
 * at a time: the top-level categories first, then the children of whichever you click. Counts are
 * INCLUSIVE of everything nested beneath a node, matching how the library browses, so the levels
 * stay comparable as you descend. A node whose children hold no assets has nothing to drill into,
 * so clicking it opens the library instead.
 *
 * Replaces RelativeCat, which plotted the legacy multi-value `categories` array.
 */

interface CategoryStat {
  count: number
  avg: number
  direct?: number
}

const axisLabelStyle = { fontSize: '0.7em', fill: 'rgba(255,255,255,0.4)', textAnchor: 'middle' as const }

/** Round tick steps, so a sqrt axis doesn't label itself 1, 6, 44, 86. */
const niceTicks = (max: number, count = 4): number[] => {
  if (!max) return [0]
  const rough = max / count
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)))
  const step = [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) || magnitude * 10
  const ticks: number[] = []
  for (let v = 0; v <= max; v += step) ticks.push(v)
  return ticks
}

interface Point {
  cat: string
  name: string
  url: string
  count: number
  avg: number
  direct: number
  drillable: boolean
}

const CategoryPopularity = ({
  data,
  type,
  name,
}: {
  data: Record<string, Record<string, CategoryStat>>
  type: string
  name: string
}) => {
  const router = useRouter()
  const [path, setPath] = useState<string | null>(null)

  const stats = data?.[type] || {}
  const node = path ? nodeFromPath(type, path) : null
  // A path that no longer resolves (a category renamed since the page was generated) falls back to
  // the roots rather than rendering an empty chart with no way out.
  const level: TaxonomyNode[] = path && node ? node.children : getRoots(type)
  const trail = node ? [...ancestorsOf(type, node), node] : []

  const points: Point[] = useMemo(
    () =>
      level
        .map((n) => ({ n, stat: stats[n.path] }))
        .filter(({ stat }) => stat && stat.count > 0)
        .map(({ n, stat }) => ({
          cat: n.path,
          name: n.name,
          url: `/${type}/${n.slugPath}`,
          count: stat.count,
          avg: stat.avg,
          direct: stat.direct || 0,
          drillable: n.children.some((c) => stats[c.path]?.count),
        })),
    [level, stats, type]
  )

  const maxCount = points.reduce((m, p) => Math.max(m, p.count), 0)

  const onPointClick = (point: Point) => {
    if (point.drillable) setPath(point.cat)
    else router.push(point.url)
  }

  const PointShape = (props: any) => {
    const { cx, cy, payload } = props
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={5}
        fill={typeColorsTransp[type]}
        stroke={typeColors[type]}
        style={{ cursor: payload.drillable ? 'zoom-in' : 'pointer' }}
        onClick={() => onPointClick(payload)}
      />
    )
  }

  const TooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const p: Point = payload[0].payload
    return (
      <div style={tooltipStyles.contentStyle}>
        <div style={tooltipStyles.labelStyle}>{p.name}</div>
        <div style={tooltipStyles.itemStyle}>
          {p.count} asset{p.count === 1 ? '' : 's'}
          {p.direct && p.direct !== p.count ? ` (${p.direct} directly here)` : ''}
        </div>
        <div style={tooltipStyles.itemStyle}>{Math.round(p.avg)} downloads/day each</div>
        <div style={{ ...tooltipStyles.itemStyle, opacity: 0.55, marginTop: '0.3em' }}>
          {p.drillable ? 'Click to explore' : 'Click to browse'}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Popularity of {name} categories:</p>
      </div>
      <div className={styles.drillCrumbs}>
        <button className={styles.drillCrumb} onClick={() => setPath(null)} disabled={!trail.length}>
          All
        </button>
        {trail.map((n) => (
          <span key={n.path} className={styles.drillCrumbWrap}>
            <MdChevronRight />
            <button className={styles.drillCrumb} onClick={() => setPath(n.path)}>
              {n.name}
            </button>
          </span>
        ))}
      </div>
      <div className={styles.medGraph}>
        {points.length ? (
          <ResponsiveContainer>
            <ScatterChart data={points} margin={{ top: 8, right: 12, bottom: 6, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
              <XAxis
                type="number"
                dataKey="count"
                // Square root, so the many small categories spread out instead of piling against
                // the axis while one big one stretches the scale.
                scale="sqrt"
                domain={[0, maxCount]}
                ticks={niceTicks(maxCount)}
                tick={{ fontSize: '0.7em' }}
                height={26}
              >
                <Label value="assets" position="insideBottom" offset={0} style={axisLabelStyle} />
              </XAxis>
              <YAxis type="number" dataKey="avg" domain={[0, 'auto']} tick={{ fontSize: '0.7em' }} width={44}>
                <Label value="downloads/day" angle={-90} position="insideLeft" offset={12} style={axisLabelStyle} />
              </YAxis>
              <Tooltip content={<TooltipContent />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter data={points} shape={<PointShape />} isAnimationActive={false} />
            </ScatterChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.graphEmpty}>
            <MdSubdirectoryArrowRight />
            <span>No assets below this category yet.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default CategoryPopularity
