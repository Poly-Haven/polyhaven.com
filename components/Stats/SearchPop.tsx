import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Label,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
  ErrorBar,
} from 'recharts'

import { typeColors, typeColorsTransp, tooltipStyles } from './chartColors'
import styles from './Stats.module.scss'

/**
 * Demand against supply: how often people search for something, and how well the library answers it.
 *
 * The x-axis used to be the average number of RESULTS a term returned, which worked while search was
 * keyword-only and a bad query returned nothing. Semantic search returns hundreds of results for
 * anything, so that axis went flat and stopped separating a well-served term from an unserved one.
 *
 * Each term is now a segment rather than a dot, spanning two similarity scores that answer two
 * different questions:
 *
 *   mean10 (the dot)   the mean of the ten best matches - do we have a SELECTION?
 *   top1   (the cap)   the single best match          - do we have THE thing at all?
 *
 * Both ends are the same unit, so the segment needs no second scale and its LENGTH is the signal:
 *
 *   short and right   deep and well served    (gravel: 0.736 -> 0.765)
 *   long              one good asset, no depth (fence:  0.485 -> 0.664, a chainlink fence then ferns)
 *   short and left    nothing close at all     (glass:  0.429 -> 0.457, closest match is a rock)
 *
 * The two ends are genuinely independent - mean10 tracks top1 at only rho 0.88 - where averages of
 * each other are not: mean5 and mean30 sit at rho 0.97 and 0.96 against mean10. That is why this
 * shows top1 and depth rather than two flavours of average, and why the numbers are computed once a
 * day by admin's searchGapStats cron rather than derived here.
 */

const axisLabelStyle = { fontSize: '0.7em', fill: 'rgba(255,255,255,0.4)', textAnchor: 'middle' as const }

const CustomizedShape = (props) => {
  const { cx, cy, fill, stroke, payload } = props
  return (
    <g>
      <a href={`/${payload.type}?s=${payload.search}`}>
        <Dot cx={cx} cy={cy} r={5} fill={fill} stroke={stroke} />
      </a>
    </g>
  )
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (!active || !payload || !payload.length) return null
  const d = payload[0].payload
  return (
    <div style={tooltipStyles.contentStyle}>
      <div style={tooltipStyles.labelStyle}>{d.search}</div>
      <div style={tooltipStyles.itemStyle}>{d.count.toLocaleString()} searches</div>
      <div style={tooltipStyles.itemStyle}>
        Match {d.mean10.toFixed(2)} typical, {d.top1.toFixed(2)} best
      </div>
      <div style={tooltipStyles.itemStyle}>
        {d.good} close {d.good === 1 ? 'match' : 'matches'}
      </div>
      <div style={{ ...tooltipStyles.itemStyle, opacity: 0.55, marginTop: '0.3em' }}>Closest: {d.best}</div>
    </div>
  )
}

interface TermStat {
  count: number
  top1: number
  mean10: number
  good: number
  best: string
}
interface DataSet {
  hdris: { [term: string]: TermStat }
  textures: { [term: string]: TermStat }
  models: { [term: string]: TermStat }
}

const SearchPop = ({ data, type, name }: { data: DataSet; type: string; name: string }) => {
  let minX = 1
  let maxX = 0
  let maxY = 0
  let minY = 999999999999
  // Indexing DataSet with a plain string widens the value to `unknown`, which loses TermStat for
  // every field access below.
  const terms: { [term: string]: TermStat } = data[type] || {}
  const graphData = Object.entries(terms)
    // A term the cron could not score has no position on this axis. Dropping it keeps one failed
    // lookup from planting a point at zero and stretching the axis over empty space.
    .filter(([, v]) => typeof v.mean10 === 'number' && typeof v.top1 === 'number')
    .map(([search, v]) => {
      minX = Math.min(minX, v.mean10)
      maxX = Math.max(maxX, v.top1)
      maxY = Math.max(maxY, v.count)
      minY = Math.min(minY, v.count)
      // ErrorBar reads [lowBound, highBound] and draws scale(value - low)..scale(value + high), so
      // this extends the segment rightwards from the dot at mean10 to the best match.
      return { ...v, search, type, err: [0, v.top1 - v.mean10] }
    })

  if (!graphData.length) {
    return (
      <div className={styles.graphSection}>
        <div className={styles.graphHeader}>
          <p>Searches for {name}s:</p>
        </div>
        <div className={styles.medGraph}>
          <div className={styles.graphEmpty}>No search data yet.</div>
        </div>
      </div>
    )
  }

  const arrayRange = (start, stop, step) => {
    step = step || 1
    return Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step)
  }

  const floorToNearestMultipleOfTen = (num) => Math.floor(num / 10) * 10

  // Similarities land in a narrow band (roughly 0.40..0.77 across all three types), so the axis is
  // pinned to the data rather than to zero - anchoring at zero would squash every point into the
  // right-hand fifth of the plot.
  const tickStep = 0.1
  const xFrom = Math.floor((minX - 0.01) / tickStep) * tickStep
  const xTo = Math.ceil((maxX + 0.01) / tickStep) * tickStep
  // Counted rather than accumulated: dividing two multiples of 0.05 lands on 6.999... about as often
  // as on 7, and arrayRange's implicit truncation would silently drop the last tick.
  const xTicks = Array.from({ length: Math.round((xTo - xFrom) / tickStep) + 1 }, (value, index) =>
    Number((xFrom + index * tickStep).toFixed(2))
  )

  return (
    <div className={styles.graphSection}>
      <div className={styles.graphHeader}>
        <p>Searches for {name}s:</p>
      </div>
      <div className={styles.medGraph}>
        <ResponsiveContainer>
          <ScatterChart data={graphData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255, 0.2)" />
            <XAxis
              type="number"
              dataKey="mean10"
              name="Match"
              domain={[xFrom, xTo]}
              ticks={xTicks}
              tickFormatter={(v) => v.toFixed(2)}
              tick={{ fontSize: '0.7em' }}
              height={26}
              interval={0}
            >
              {/* Named on the axis because the number is a cosine similarity, which means nothing on
                  its own - roughly 0.42 is "we have nothing like this" and 0.75 is "we have a shelf
                  of them". No threshold line: present and absent concepts overlap at 0.495 vs 0.519,
                  so any fixed cutoff would be inventing a boundary the scores do not support. */}
              <Label value="match quality" position="insideBottom" offset={0} style={axisLabelStyle} />
            </XAxis>
            <YAxis
              type="number"
              dataKey="count"
              name="Searches"
              scale="sqrt"
              domain={['dataMin - 1', 'dataMax + 4']}
              ticks={arrayRange(
                floorToNearestMultipleOfTen(Math.ceil(minY * 0.9)),
                maxY,
                floorToNearestMultipleOfTen(Math.floor(maxY / 6))
              )}
              tick={{ fontSize: '0.7em' }}
              interval={0}
            />

            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            {/* isAnimationActive={false} is load-bearing, not a style choice: Scatter.renderErrorBar
                returns null until the entry animation reports finished, and a tab that is in the
                background when the chart mounts never gets there - the dots appear and the segments
                never do. Even in a foreground tab it means the segments pop in late, and here the
                segment IS the measurement rather than decoration. */}
            <Scatter
              data={graphData}
              fill={typeColorsTransp[type]}
              stroke={typeColors[type]}
              shape={<CustomizedShape />}
              isAnimationActive={false}
            >
              <ErrorBar
                dataKey="err"
                direction="x"
                width={4}
                strokeWidth={1}
                stroke={typeColors[type]}
                strokeOpacity={0.6}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default SearchPop
