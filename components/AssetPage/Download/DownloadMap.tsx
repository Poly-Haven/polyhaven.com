import filesize from 'filesize'

import Tooltip from 'components/Tooltip/Tooltip'

import { titleCase } from 'utils/stringUtils'

import styles from './DownloadOptions.module.scss'

const DownloadMap = ({ name, res, data }) => {

  let displayName = titleCase(name.replace('_', ' '))
  if (name === 'nor_gl' || name === 'nor_dx') {
    displayName = "Normal"
  }
  if (name === 'AO') {
    displayName = "AO"
  }
  if (name === 'rough_ao') {
    displayName = "Rough AO"
  }

  return (
    <div className={styles.optionRow}>
      <p>{displayName}</p>
      {Object.keys(data).sort().map((f, i) =>
        <a
          key={i}
          href={data[f].url}
          target="_blank"
          className={styles.format}
          data-tip={`${res} ${f}: ${filesize(data[f].size)}`}
        >
          {f}
        </a>
      )}
      <Tooltip />
    </div>
  )
}

export default DownloadMap
