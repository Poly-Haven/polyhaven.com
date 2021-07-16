import filesize from 'filesize'

import { MdVisibility } from 'react-icons/md'

import Tooltip from 'components/Tooltip/Tooltip'

import { titleCase } from 'utils/stringUtils'

import styles from './DownloadOptions.module.scss'

const DownloadMap = ({ name, res, data, trackDownload, setPreview }) => {

  let displayName = titleCase(name.replace(/_/g, ' '))
  if (name === 'nor_gl' || name === 'nor_dx') {
    displayName = "Normal"
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

  const preview = (e) => {
    let url = data.jpg.url
    url = url.replace(`jpg/${res}/`, 'jpg/1k/')
    url = url.replace(`_${res}.jpg`, '_1k.jpg')
    setPreview(url)
  }

  return (
    <div className={styles.optionRow}>
      <div
        className={styles.viewBtn}
        onClick={preview}
      >
        <MdVisibility />
      </div>
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
          {f}
        </a>
      )}
      <Tooltip />
    </div>
  )
}

export default DownloadMap
