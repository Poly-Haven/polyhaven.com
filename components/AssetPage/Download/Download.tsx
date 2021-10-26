import { useState, useEffect, useReducer } from "react";
import filesize from 'filesize'
import { v4 as uuid } from 'uuid';

import { MdFileDownload, MdMenu, MdArrowBack } from 'react-icons/md'
import { GoFileZip } from "react-icons/go";

import Dropdown from 'components/UI/Dropdown/Dropdown'
import DownloadOptions from './DownloadOptions'
import Loader from 'components/UI/Loader/Loader'
import IconBlender from 'components/UI/Icons/Blender'
import IconGltf from 'components/UI/Icons/glTF'
import Tooltip from 'components/Tooltip/Tooltip'

import { sortRes } from 'utils/arrayUtils'
import { urlBaseName } from 'utils/stringUtils'

import styles from './Download.module.scss'

// Just to keep TS happy, this function exists in /public/download-js/download.js, which is loaded in _document.tsx
declare const startDownload

const Download = ({ assetID, data, files, setPreview, patron }) => {
  const [busyDownloading, setBusyDownloading] = useState(false)
  const [dlOptions, setDlOptions] = useState(false)
  const [zipList, dispatch] = useReducer(reducer, { files: [] });
  const [prefRes, setRes] = useState('4k')
  const [prefFmt, setFmt] = useState('exr')
  const [tempUUID, setTempUUID] = useState(uuid())  // Used if storage consent not given.

  const isHDRI = data.type === 0

  function reducer(state, action) {
    const data = action.key
    if (action.add) {
      for (const f of state.files) {
        if (data.md5 === f.md5) {
          return { files: state.files }
        }
      }
      return { files: [...state.files, data] };
    } else {
      return { files: state.files.filter(k => k.md5 !== data.md5) };
    }
  }

  const selectMap = (key, add) => {
    dispatch({ key, add })
  }

  useEffect(() => {
    setRes(localStorage.getItem(`assetPref_${data.type}_resolution`) || '4k')
    setFmt(localStorage.getItem(`assetPref_${data.type}_format`) || 'exr')
  }, [prefRes, prefFmt]);

  if (!files) {
    return <div className={styles.downloadBtnWrapper}><div className={styles.downloadBtn}><span className={styles.error}>No files?<br /><em>Try refresh, otherwise please report this to us.</em></span></div></div>
  }

  if (data.date_published * 1000 > Date.now()) {
    if (!patron.rewards || !patron.rewards.includes('Early Access')) {
      return <div className={styles.downloadBtnWrapper}><div className={styles.downloadBtn}>Coming Soon!</div></div>
    }
  }

  // Find a key that we can use to fetch available resolutions and formats.
  let baseKey = 'UNKNOWN'
  const baseKeys = ['hdri', 'blend', 'Diffuse', 'nor_gl', 'Rough', 'Displacement']
  for (const k of baseKeys) {
    if (Object.keys(files).includes(k)) {
      baseKey = k
      break;
    }
  }
  if (baseKey === 'UNKNOWN') {
    return <div className={styles.downloadBtnWrapper}><div className={styles.downloadBtn}>baseKey unknown!</div></div>
  }

  const toggleDlOptions = () => {
    setDlOptions(!dlOptions);
  }

  const resOptionKeys = sortRes(Object.keys(files[baseKey]));
  const resOptions = {}
  for (const r of resOptionKeys) {
    resOptions[r] = { label: r.toUpperCase() }
  }
  const setResValue = v => {
    setRes(v)
    localStorage.setItem(`assetPref_${data.type}_resolution`, v)
  }
  const dlRes = resOptionKeys.includes(prefRes) ? prefRes : resOptionKeys.slice(-1)[0]

  const fmtOptions = isHDRI ? {
    hdr: {
      label: "HDR",
      tooltip: "Radiance RGBE (.hdr)<br/>Usually smaller and more widely supported than EXR, but may very rarely have less accurate colors."
    },
    exr: {
      label: "EXR",
      tooltip: "Open EXR (.exr)<br/>True 32-bit per channel, losslessly compressed."
    },
  } : {
    blend: {
      label: "Blend",
      tooltip: "Blender 2.8+<br/>Includes all required texture maps.",
      icon: <IconBlender />
    },
    gltf: {
      label: "glTF",
      tooltip: "glTF 2.0, supported by most 3D software.<br/>Includes all required texture maps.",
      icon: <IconGltf />
    },
    zip: {
      label: "ZIP",
      tooltip: "Choose exactly which files to download.",
      icon: <GoFileZip />
    },
  };
  if (!Object.keys(files).includes('gltf')) {
    delete fmtOptions.gltf
  }

  const setFmtValue = v => {
    setFmt(v)
    localStorage.setItem(`assetPref_${data.type}_format`, v)
    if (v === 'zip') {
      setDlOptions(true)
    }
  }
  const dlFmt = Object.keys(fmtOptions).includes(prefFmt) ? prefFmt : (isHDRI ? 'hdr' : 'blend')

  let fsize = 0
  if (dlFmt !== 'zip') {
    const fileInfo = files[isHDRI ? 'hdri' : dlFmt][dlRes][dlFmt]
    fsize = fileInfo.size
    if (fileInfo.include) {
      for (const i of Object.values(fileInfo.include)) {
        fsize += i['size']
      }
    }
  } else {
    for (const f of zipList.files) {
      fsize += f.size
    }
  }

  const trackDownload = async () => {
    const data = {
      uuid: localStorage.getItem(`uuid`) || tempUUID,
      asset_id: assetID,
      res: dlRes,
      format: dlFmt
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

  const downloadZip = async () => {
    if (busyDownloading) {
      return
    }
    setBusyDownloading(true)
    let name = `${assetID}_${dlRes}`
    let dlFiles = []
    if (dlFmt !== 'zip') {
      const fileInfo = files[dlFmt][dlRes][dlFmt]
      name = urlBaseName(fileInfo.url)
      dlFiles.push({
        url: fileInfo.url,
        size: fileInfo.size,
        path: name
      })
      if (fileInfo.include) {
        for (const path of Object.keys(fileInfo.include)) {
          dlFiles.push({
            url: fileInfo.include[path].url,
            size: fileInfo.include[path].size,
            path: path
          })
        }
      }
    } else {
      for (const f of zipList.files) {
        const basePath = ['blend', 'gltf'].includes(f.fmt) ? "" : "textures/"
        dlFiles.push({
          url: f.url,
          size: f.size,
          path: basePath + urlBaseName(f.url)
        })
      }
    }
    startDownload(name, dlFiles)

    await new Promise(r => setTimeout(r, 2000)).then(_ => {
      // Purely for a visual indication that something is happending, and to prevent accidental double clicks.
      setBusyDownloading(false)
    })
    await trackDownload();
  }

  return (
    <div>
      <div className={styles.downloadBtnWrapper}>
        <Dropdown
          value={dlRes}
          options={resOptions}
          onChange={setResValue}
          small={true}
          tooltipID="dropdown-res"
        />

        <Dropdown
          value={dlFmt}
          options={fmtOptions}
          onChange={setFmtValue}
          small={true}
          tooltipSide="left"
          tooltipID="dropdown-fmt"
        />

        <a
          href={isHDRI ? files['hdri'][dlRes][dlFmt].url : null}
          target="_blank"
          rel="noopener"
          className={`${styles.downloadBtn} ${busyDownloading ? styles.disabled : null}`}
          onClick={isHDRI ? trackDownload : downloadZip}
        >
          <MdFileDownload />
          <div>
            <h3>Download</h3>
            <p>{filesize(fsize)}</p>
          </div>
          <div className={`${styles.busyDownloading} ${busyDownloading ? styles.show : null}`}><Loader /></div>
        </a>
        <div className={styles.downloadBtnSml} onClick={toggleDlOptions}>
          {dlOptions ? <MdArrowBack /> : <MdMenu />}
        </div>
      </div>
      <DownloadOptions
        open={dlOptions}
        assetID={assetID}
        tempUUID={tempUUID}
        files={files}
        res={dlRes}
        fmt={dlFmt}
        selectMap={selectMap}
        type={data.type}
        setPreview={setPreview}
      />
      <Tooltip id='dropdown' place='left' />
    </div>
  )
}

export default Download
