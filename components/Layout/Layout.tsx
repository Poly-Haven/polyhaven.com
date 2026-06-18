import Header from 'components/Layout/Header/Header'
import Tooltip from 'components/UI/Tooltip/Tooltip'

import styles from './Layout.module.scss'

const layout = ({ children }) => {
  return (
    <div id={styles.layout}>
      <Header />
      <div className={styles.page}>{children}</div>
      {/* App-wide default host so any `data-tip` element (e.g. in the library grid)
          always has a binder, even on pages that render no local <Tooltip/>. */}
      <Tooltip />
    </div>
  )
}

export default layout
