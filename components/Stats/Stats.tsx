import Tooltip from 'components/Tooltip/Tooltip'
import LastThreeMonths from './LastThreeMonths'
import RelativeType from './RelativeType'
import AssetsPerMonth from './AssetsPerMonth'

import styles from './Stats.module.scss'

/* Ideas:
  Downloads per month over all time (wait until like 2022)
  Patrons over time
  Comparison of resolutions
  Comparison of formats
  Assets published per month
  Downloads per $ donated
  Downloads per day relative to number of assets of that type available at the time
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
            <div className={styles.half} style={{ height: '50vh' }}>
              <div className={styles.centered}>More coming soon :)</div>
            </div>
          </div>
        </div>
      </div>
      <Tooltip />
    </div>
  )
}

export default Stats
