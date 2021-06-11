import { useState, useEffect } from 'react'

import DownloadMap from './DownloadMap'
import Switch from 'components/UI/Switch/Switch'

import { sortCaseInsensitive } from 'utils/arrayUtils'

import styles from './DownloadOptions.module.scss'

const Download = ({ open, files, res, format }) => {
  const [norMode, setNorMode] = useState('gl')

  useEffect(() => {
    setNorMode(localStorage.getItem(`assetPref_normalType`) || 'gl')
  }, []);

  const toggleNormalStyle = () => {
    const v = norMode === 'gl' ? 'dx' : 'gl'
    setNorMode(v)
    localStorage.setItem(`assetPref_normalType`, v)
  }

  return (
    <div className={styles.wrapper}>
      <div id='download_options' className={`${styles.optionsWrapper} ${!open ? styles.optionsHidden : null}`}>
        {sortCaseInsensitive(Object.keys(files)).map((m, i) =>
          !['blend', 'gltf'].includes(m) ?
            m !== 'nor_dx' || norMode === 'dx' ?
              m !== 'nor_gl' || norMode === 'gl' ?
                <DownloadMap key={i} name={m} res={res} data={files[m][res]} />
                : null
              : null
            : null
        )}
        <div className={styles.optionRow}>
          <p style={{ textAlign: 'right' }}>Normal Map Standard:</p>
          <div data-tip="OpenGL: Blender / Maya / Unity.<br />DirectX: Unreal / Godot / 3ds Max.">
            <Switch
              on={norMode === 'gl'}
              onClick={toggleNormalStyle}
              labelOn="GL"
              labelOff="DX"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Download
