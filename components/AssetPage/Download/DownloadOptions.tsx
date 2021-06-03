import { useState } from 'react'

import DownloadMap from './DownloadMap'
import Switch from 'components/UI/Switch/Switch'

import { sortCaseInsensitive } from 'utils/arrayUtils'

import styles from './DownloadOptions.module.scss'

const Download = ({ open, files, res, format }) => {
  const [norGl, setNorGl] = useState(true)

  const toggleNormalStyle = () => {
    setNorGl(!norGl)
  }

  return (
    <div className={styles.wrapper}>
      <div id='download_options' className={`${styles.optionsWrapper} ${!open ? styles.optionsHidden : null}`}>
        {sortCaseInsensitive(Object.keys(files)).map((m, i) =>
          !['blend', 'gltf'].includes(m) ?
            m !== 'nor_dx' || !norGl ?
              m !== 'nor_gl' || norGl ?
                <DownloadMap key={i} name={m} res={res} data={files[m][res]} />
                : null
              : null
            : null
        )}
        <div className={styles.optionRow}>
          <p style={{ textAlign: 'right' }}>Normal Map Standard:</p>
          <div data-tip="OpenGL: Blender / Maya / Unity.<br />DirectX: Unreal / Godot / 3ds Max.">
            <Switch
              on={norGl}
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
