import { useState } from 'react'

import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'

import styles from './DownloadOptions.module.scss'

const MapSelector = ({ res, fmt, filesize }) => {
  const [checked, setChecked] = useState(false)

  const toggle = _ => {
    setChecked(!checked)
  }

  return (
    <span
      className={`${styles.format} ${checked ? styles.checked : ''}`}
      onClick={toggle}
      data-key={fmt}
      data-tip={`${res} ${fmt}: ${filesize}`}
    >
      {checked ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}{fmt}
    </span>
  )
}

export default MapSelector
