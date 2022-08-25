import filesize from 'filesize'

import { MdFileDownload } from 'react-icons/md'

import Tooltip from 'components/UI/Tooltip/Tooltip'
import MapSelector from './MapSelector'

import { titleCase } from 'utils/stringUtils'

import styles from './DownloadOptions.module.scss'

const DownloadMap = ({ name, res, fmt, type, data, trackDownload, selectMap }) => {
  let displayName = titleCase(name.replace(/_/g, ' '))
  if (name === 'nor_gl' || name === 'nor_dx') {
    if (fmt !== 'zip') {
      displayName = "Normal"
    } else {
      displayName = `Normal (${name.substring(name.length - 2).toUpperCase()})`
    }
  }
  if (name === 'AO') {
    displayName = "AO"
  }
  if (name === 'rough_ao') {
    displayName = "Rough AO"
  }
  if (name === 'arm') {
    displayName = "AO/Rough/Metal"
  }
  if (name === 'rma') {
    displayName = "Rough/Metal/AO"
  }

  if (fmt !== 'zip') {
    return (
      <div className={styles.optionRow}>
        <p>{displayName}</p>
        {Object.keys(data).sort().map((f, i) =>
          <a
            key={i}
            href={data[f].url}
            className={styles.format}
            target="_blank"
            rel="noopener"
            data-res={res}
            data-format={`${name}:${f}`}
            onClick={trackDownload}
            data-tip={`${res} ${f}: ${filesize(data[f].size)}`}
          >
            <MdFileDownload />{f}
          </a>
        )}
        <Tooltip />
      </div>
    )
  } else {
    return (
      <div className={styles.optionRow}>
        <p>{displayName}</p>
        {Object.keys(data).sort().map((f, i) =>
          <MapSelector
            key={i}
            name={name}
            res={res}
            fmt={f}
            type={type}
            data={data[f]}
            filesize={filesize(data[f].size)}
            selectMap={selectMap}
          />
        )}
        <Tooltip />
      </div>
    )
  }
}

export default DownloadMap
