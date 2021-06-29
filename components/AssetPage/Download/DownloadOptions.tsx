import { useState, useEffect } from 'react'
import filesize from 'filesize'

import { GoLinkExternal } from 'react-icons/go'

import BackplateList from './BackplateList'
import DownloadMap from './DownloadMap'
import Switch from 'components/UI/Switch/Switch'
import IconMacbeth from 'components/UI/Icons/Macbeth'
import IconPatreon from 'components/UI/Icons/Patreon'
import Tooltip from 'components/Tooltip/Tooltip'

import { sortCaseInsensitive } from 'utils/arrayUtils'

import styles from './DownloadOptions.module.scss'

const DownloadOptions = ({ open, assetID, tempUUID, files, res, type, setPreview }) => {
  const [norMode, setNorMode] = useState('gl')

  useEffect(() => {
    setNorMode(localStorage.getItem(`assetPref_normalType`) || 'gl')
  }, []);

  const toggleNormalStyle = () => {
    const v = norMode === 'gl' ? 'dx' : 'gl'
    setNorMode(v)
    localStorage.setItem(`assetPref_normalType`, v)
  }

  const trackDownload = async (e) => {
    const data = {
      uuid: localStorage.getItem(`uuid`) || tempUUID,
      asset_id: assetID,
      res: e.currentTarget.dataset.res,
      format: e.currentTarget.dataset.format
    }
    await fetch(`/api/dlTrack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(res => res.json())
      .then(resdata => {
        console.log("Tracked download:", data)
      })
  }

  return (
    <div className={styles.wrapper}>
      <div id='download_options' className={`${styles.optionsWrapper} ${!open ? styles.optionsHidden : null}`}>
        {type === 0 ? null : sortCaseInsensitive(Object.keys(files)).map((m, i) =>
          !['blend', 'gltf'].includes(m) ?
            m !== 'nor_dx' || norMode === 'dx' ?
              m !== 'nor_gl' || norMode === 'gl' ?
                <DownloadMap key={i} name={m} res={res} data={files[m][res]} trackDownload={trackDownload} />
                : null
              : null
            : null
        )}
        {type === 0 ? null :
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
        }
        {type === 0 && files['tonemapped'] ? <>
          <div className={`${styles.optionRow} ${styles.wideOptionRow}`} data-tip="A low dynamic range preview of the HDRI. Sometimes useful as a preview, or for non-CG related uses, but do not use for lighting.">
            <a
              href={files['tonemapped'].url}
              className={styles.format}
              target="_blank"
              data-res="tm"
              onClick={trackDownload}
            >8K Tonemapped JPG • {filesize(files['tonemapped'].size)}</a>
          </div>
        </> : null}
        {type === 0 && files['colorchart'] ? <>
          <div className={`${styles.optionRow} ${styles.wideOptionRow}`}>
            <a
              href={files['colorchart'].url}
              className={styles.format}
              target="_blank"
              data-res="cc"
              onClick={trackDownload}
            ><IconMacbeth />Color Chart • {filesize(files['colorchart'].size)}</a>
          </div>
        </> : null}
        <div
          className={`${styles.optionRow} ${styles.wideOptionRow}`}
          data-tip="Support us with $5 per month and receive access to our cloud system, allowing you to sync our entire library to your hard drive."
        >
          <a
            href="https://www.patreon.com/polyhaven/overview"
            className={styles.format}
            target="_blank"
          ><IconPatreon color="#f96753" />Offline Access <GoLinkExternal style={{ marginLeft: "0.5em" }} /></a>
        </div>
        {type === 0 && files['backplates'] ? <BackplateList assetID={assetID} files={files['backplates']} trackDownload={trackDownload} setPreview={setPreview} /> : null}
      </div>
      <Tooltip />
    </div>
  )
}

export default DownloadOptions
