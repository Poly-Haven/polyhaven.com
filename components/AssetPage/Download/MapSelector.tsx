import { useState, useEffect } from 'react'

import { MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md'

import styles from './DownloadOptions.module.scss'

const MapSelector = ({ name, res, fmt, type, url, filesize, selectMap }) => {
  const [checked, setChecked] = useState(false)
  const storageKey = `assetPref_sel_${type}_${name}_${fmt}`

  const enabledByDefault = [
    'blend_blend',
    'gltf_gltf',
    'arm_jpg',
    'Diffuse_jpg',
    'Displacement_png',
    'Rough_exr',
    'Metal_exr',
    'nor_gl_exr',
    'nor_dx_exr',
    'AO_jpg',
    'Bump_exr',
    'Alpha_png',
    'Emission_png',
    'Mask_png',
  ]
  enabledByDefault.forEach((name, index) => enabledByDefault[index] = `assetPref_sel_${type}_${name}`);

  useEffect(() => {
    const storedValue = JSON.parse(localStorage.getItem(storageKey))
    const v = storedValue !== null ? storedValue : enabledByDefault.includes(storageKey)
    setChecked(v)
    selectMap(url, v)
  }, []);

  const toggle = _ => {
    const v = !checked
    setChecked(v)
    selectMap(url, v)
    localStorage.setItem(storageKey, JSON.stringify(v))
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
