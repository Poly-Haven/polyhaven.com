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
 * Every category is plotted at once, all three levels of the tree together, with the dot shrinking
 * as it goes deeper. Counts are INCLUSIVE of everything nested beneath a node, matching how the
 * library browses, so a top-level dot sits to the right of its own children rather than competing
 * with them - the size and the position agree about which is the broader category.
 *
 * Clicking a category with populated children narrows the chart to that subtree, which is the only
 * way to read a dense branch; a breadcrumb goes back up. A node with nothing under it opens the
 * library instead.
 *
 * Replaces RelativeCat, which plotted the legacy multi-value `categories` array.
 */

/** Dot radius by depth, so the level a category sits at is legible without reading the tooltip. */
const RADIUS = [7, 7, 5, 3.5]
const radiusFor = (depth: number) => RADIUS[depth] || 3

interface CategoryStat {
  count: number
  avg: number
  direct?: number
}

const axisLabelStyle = { fontSize: '0.7em', fill: 'rgba(255,255,255,0.4)', textAnchor: 'middle' as const }

/**
 * Ticks for a log axis: the 1-2-5 sequence, clipped to the domain. Recharts' own log ticks are
 * evenly spaced in value, which on a log scale bunches them all against one end.
 *
 * A narrow domain can contain no 1-2-5 value at all - focusing a branch whose categories all sit
 * between 21 and 28 a day is enough, which is most of them. Recharts takes an empty `ticks` array
 * as authoritative: it drops every horizontal gridline and falls back to its own labels, so the
 * grid and the axis end up disagreeing. Derive ticks from the domain itself in that case.
 */
const logTicks = (min: number, max: number, integers = false): number[] => {
  const out: number[] = []
  for (let e = Math.floor(Math.log10(min)); e <= Math.ceil(Math.log10(max)); e++) {
    for (const m of [1, 2, 5]) {
      const v = m * Math.pow(10, e)
      if (v >= min && v <= max) out.push(v)
    }
  }
  if (out.length >= 2) return out
  const round = integers ? Math.round : (v: number) => Number(v.toPrecision(2))
  // Geometric midpoint, since the scale is logarithmic and the arithmetic mean would sit visually
  // off-centre.
  return Array.from(new Set([round(min), round(Math.sqrt(min * max)), round(max)])).filter((v) => v > 0)
}

interface Point {
  cat: string
  name: string
  trail: string
  depth: number
  url: string
  count: number
  avg: number
  plotAvg: number
  direct: number
  drillable: boolean
}

/**
 * A log axis cannot place zero, and a category published a couple of days ago with no downloads
 * yet would land at -Infinity and vanish. Plot those at the floor and keep `avg` itself untouched
 * for the tooltip, so the dot is visible and the number it reports is still the real one.
 */
const AVG_FLOOR = 0.1

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
  // the whole tree rather than rendering an empty chart with no way out.
  const crumbs = node ? [...ancestorsOf(type, node), node] : []

  // The focused subtree, flattened: the node itself plus every descendant, or the whole tree when
  // nothing is focused.
  const scope: TaxonomyNode[] = useMemo(() => {
    const out: TaxonomyNode[] = []
    const walk = (nodes: TaxonomyNode[]) => {
      for (const n of nodes) {
        out.push(n)
        walk(n.children)
      }
    }
    walk(node ? [node] : getRoots(type))
    return out
  }, [node, type])

  const points: Point[] = useMemo(
    () =>
      scope
        .map((n) => ({ n, stat: stats[n.path] }))
        .filter(({ stat }) => stat && stat.count > 0)
        .map(({ n, stat }) => {
          const parts = n.path.split('/')
          return {
            cat: n.path,
            name: n.name,
            trail: parts.slice(0, -1).join(' › '),
            depth: parts.length,
            url: `/${type}/${n.slugPath}`,
            count: stat.count,
            avg: stat.avg,
            plotAvg: Math.max(stat.avg, AVG_FLOOR),
            direct: stat.direct || 0,
            drillable: n.children.some((c) => stats[c.path]?.count),
          }
        })
        // Shallow first, so the small deep dots paint on top of the big shallow rings that contain
        // them rather than disappearing underneath.
        .sort((a, b) => a.depth - b.depth),
    [scope, stats, type]
  )

  // Both axes are heavily skewed - most categories are small and most averages are modest, with a
  // handful of each an order of magnitude out - so both are log scaled and the domains come from
  // the data. A linear axis put 95% of the dots in the bottom fifth of the chart.
  const bounds = points.reduce(
    (b, p) => ({
      maxCount: Math.max(b.maxCount, p.count),
      minAvg: Math.min(b.minAvg, p.plotAvg),
      maxAvg: Math.max(b.maxAvg, p.plotAvg),
    }),
    { maxCount: 1, minAvg: Infinity, maxAvg: 1 }
  )
  // Padded outwards - multiplicatively, since the scale is logarithmic - so the dots sitting at the
  // extremes are not sliced in half by the axis. The single-asset column is always at one edge.
  const domainX: [number, number] = [1 / 1.3, bounds.maxCount * 1.3]
  const domainY: [number, number] = [Math.min(bounds.minAvg, bounds.maxAvg) / 1.4, bounds.maxAvg * 1.4]

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
        r={radiusFor(payload.depth)}
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
        {/* Every level is on the chart at once, so a bare name like "Chairs" or "Industrial" does
            not say where the dot sits. */}
        {p.trail ? <div style={{ ...tooltipStyles.itemStyle, opacity: 0.45 }}>{p.trail}</div> : null}
        <div style={tooltipStyles.labelStyle}>{p.name}</div>
        <div style={tooltipStyles.itemStyle}>
          {p.count} asset{p.count === 1 ? '' : 's'}
          {p.direct && p.direct !== p.count ? ` (${p.direct} directly here)` : ''}
        </div>
        <div style={tooltipStyles.itemStyle}>{Math.round(p.avg)} downloads/day each</div>
        <div style={{ ...tooltipStyles.itemStyle, opacity: 0.55, marginTop: '0.3em' }}>
          {p.drillable ? 'Click to focus' : 'Click to browse'}
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
        <button className={styles.drillCrumb} onClick={() => setPath(null)} disabled={!crumbs.length}>
          All
        </button>
        {crumbs.map((n) => (
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
                scale="log"
                domain={domainX}
                ticks={logTicks(domainX[0], domainX[1], true)}
                tick={{ fontSize: '0.7em' }}
                height={26}
                allowDataOverflow
              >
                <Label value="assets" position="insideBottom" offset={0} style={axisLabelStyle} />
              </XAxis>
              <YAxis
                type="number"
                dataKey="plotAvg"
                scale="log"
                domain={domainY}
                ticks={logTicks(domainY[0], domainY[1])}
                tick={{ fontSize: '0.7em' }}
                width={44}
                allowDataOverflow
              >
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
