import { timeDiff } from 'utils/dateUtils'
import ErrorBoundary from 'utils/ErrorBoundary'

import Tooltip from 'components/UI/Tooltip/Tooltip'
import LastThreeMonths from './LastThreeMonths'
import RelativeCat from './RelativeCat'
import RelativeType from './RelativeType'
import AssetsPerMonth from './AssetsPerMonth'
import ResolutionComparison from './ResolutionComparison'
import TrafficGraph from './TrafficGraph'
import PatronCounts from './PatronCounts'
import SearchPop from './SearchPop'
import StatBlock from './StatBlock/StatBlock'

import styles from './Stats.module.scss'

/* Ideas:
  Downloads per month over all time (wait until like 2022)
  Patrons over time
  Downloads per $ donated
  Patreon earnings per assets available
*/

const Stats = ({ datasets }) => {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Stats</h1>
      </div>

      <div className={styles.row}>
        <ErrorBoundary>
          <div className={styles.half}>
            <LastThreeMonths data={datasets.threeMonths} />
          </div>
        </ErrorBoundary>
        <div className={styles.half}>
          <div className={styles.row}>
            <div className={styles.half}>
              <div className={styles.graphHeader}>
                <p>Downloads by format chosen:</p>
              </div>
              <ErrorBoundary>
                {Object.keys(datasets.formats).map((k, i) => (
                  <ResolutionComparison key={i} data={datasets.formats[k]} type={k} />
                ))}
              </ErrorBoundary>
              <p style={{ marginBottom: 0 }}>Notes:</p>
              <ul className={styles.unNumberedNotesList}>
                <li>EXR is the default format for HDRIs.</li>
                <li>Blend is the default format for textures and models.</li>
                <li>EXR/JPG/PNG are individual texture maps, not entire assets.</li>
                <li>ZIP may include a variety of contents.</li>
              </ul>
            </div>
            <div className={styles.half}>
              <div className={styles.graphHeader}>
                <p>Downloads by resolution chosen:</p>
              </div>
              <ErrorBoundary>
                {Object.keys(datasets.resolutions).map((k, i) => (
                  <ResolutionComparison key={i} data={datasets.resolutions[k]} type={k} />
                ))}
              </ErrorBoundary>
              <p style={{ marginBottom: 0 }}>Notes:</p>
              <ul className={styles.unNumberedNotesList}>
                <li>4k is the default resolution for all assets.</li>
                <li>For most textures, 8k is the highest resolution.</li>
                <li>For many models, 4k is the highest resolution.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.spacer} />

      <ErrorBoundary>
        <div className={styles.row}>
          <div className={styles.half}>
            <RelativeCat data={datasets.relativecategory} type="hdris" name="HDRI" />
          </div>
          <div className={styles.half}>
            <RelativeCat data={datasets.relativecategory} type="textures" name="Texture" />
          </div>
          <div className={styles.half}>
            <RelativeCat data={datasets.relativecategory} type="models" name="Model" />
          </div>
          <div className={styles.half}>
            <RelativeType data={datasets.relativeType} />
          </div>
          <div className={styles.half}>
            <AssetsPerMonth data={datasets.monthlyAssets} />
          </div>
        </div>
      </ErrorBoundary>

      <div className={styles.spacer} />

      <ErrorBoundary>
        <div className={styles.row}>
          <div className={styles.half}>
            <SearchPop data={datasets.searches} type="hdris" name="HDRI" />
          </div>
          <div className={styles.half}>
            <SearchPop data={datasets.searches} type="textures" name="Texture" />
          </div>
          <div className={styles.half}>
            <SearchPop data={datasets.searches} type="models" name="Model" />
          </div>
        </div>
        <div style={{ fontStyle: 'italic', textAlign: 'right', width: '100%', opacity: '0.4' }}>
          Based on {datasets.searches.meta.total} searches in the last{' '}
          {timeDiff(
            new Date(datasets.searches.meta.earliestSearch),
            new Date(datasets.searches.meta.latestSearch),
            true
          )}
          .
        </div>
      </ErrorBoundary>

      <div className={styles.spacer} />

      <ErrorBoundary>
        <div className={styles.row}>
          <div className={styles.half}>
            <TrafficGraph data={datasets.cfdaily} assetDates={datasets.assetDates} />
          </div>
        </div>
      </ErrorBoundary>

      <div className={styles.spacer} />

      <ErrorBoundary>
        <div className={styles.row} style={{ alignItems: 'center', justifyContent: 'center' }}>
          <p>Monthly Traffic:</p>
          <StatBlock head={`${(datasets.monthlyDownloads / 1000000).toFixed(1)}M`} text="Downloads" />
          <StatBlock head={`${Math.round(datasets.traffic.terabytes)}TB`} text="Bandwidth" />
          <StatBlock head={`${(datasets.traffic.users / 1000000).toFixed(1)}M`} text="Users" />
        </div>
      </ErrorBoundary>

      <div className={styles.spacer} />

      <ErrorBoundary>
        <div className={styles.row}>
          <div className={styles.half}>
            <PatronCounts data={datasets.patronCounts} />
          </div>
        </div>
      </ErrorBoundary>

      <Tooltip />
    </div>
  )
}

export default Stats
