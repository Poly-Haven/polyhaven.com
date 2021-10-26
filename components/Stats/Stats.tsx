import Tooltip from 'components/Tooltip/Tooltip'
import LastThreeMonths from './LastThreeMonths'
import RelativeType from './RelativeType'
import AssetsPerMonth from './AssetsPerMonth'
import ResolutionComparison from './ResolutionComparison'

import styles from './Stats.module.scss'

/* Ideas:
  Downloads per month over all time (wait until like 2022)
  Patrons over time
  Comparison of formats
  Downloads per $ donated
  Downloads by category
  Bandwith usage
  Patreon earnings per assets available
*/

const Stats = ({ datasets }) => {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Stats</h1>
      </div>

      <div className={styles.row}>
        <div className={styles.half}>
          <LastThreeMonths data={datasets.threeMonths} />
        </div>
        <div className={styles.half}>
          <div className={styles.row}>
            <div className={styles.half}>
              <RelativeType data={datasets.relativeType} />
              <AssetsPerMonth data={datasets.monthlyAssets} />
            </div>
            <div className={styles.half}>
              <div className={styles.graphHeader}>
                <p>Downloads by resolution chosen:</p>
              </div>
              {Object.keys(datasets.resolutions).map((k, i) =>
                <ResolutionComparison key={i} data={datasets.resolutions[k]} type={k} />
              )}
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
      <Tooltip />
    </div>
  )
}

export default Stats
