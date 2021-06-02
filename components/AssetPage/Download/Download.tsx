import { useEffect } from "react";
import { useState } from 'react'
import filesize from 'filesize'

import { MdFileDownload, MdMenu, MdArrowBack } from 'react-icons/md'

import Dropdown from 'components/UI/Dropdown/Dropdown';
import DownloadOptions from './DownloadOptions'
import Loader from 'components/UI/Loader/Loader'

import { sortRes } from 'utils/arrayUtils'
import { urlBaseName } from 'utils/stringUtils'
import apiSWR from 'utils/apiSWR'

import styles from './Download.module.scss'

// Just to keep TS happy, these funcitons exists in /public/download-js/download.js, which are loaded in _document.tsx
declare const testDownload
declare const startDownload

const Download = ({ assetID, data }) => {
  const [busyDownloading, setBusyDownloading] = useState(false)
  const [dlOptions, setDlOptions] = useState(false)
  const [prefRes, setRes] = useState('4k')
  const [prefFmt, setFmt] = useState('exr')

  const isHDRI = data.type === 0

  useEffect(() => {
    setRes(localStorage.getItem(`assetPref_${data.type}_resolution`) || '4k')
    setFmt(localStorage.getItem(`assetPref_${data.type}_format`) || 'exr')
  });

  const { data: files, error } = apiSWR(`/files/${assetID}`, { revalidateOnFocus: false });
  if (error) {
    return <div><div className={styles.downloadBtn}>Error!</div></div>
  } else if (!files) {
    return <div><div className={styles.downloadBtn}><Loader /></div></div>
  }

  // Find a key that we can use to fetch available resolutions and formats.
  let baseKey = 'UNKNOWN'
  const baseKeys = ['hdri', 'Diffuse', 'nor_gl', 'Rough', 'Displacement']
  for (const k of baseKeys) {
    if (Object.keys(files).includes(k)) {
      baseKey = k
      break;
    }
  }
  if (baseKey === 'UNKNOWN') {
    return <div><div className={styles.downloadBtn}>baseKey unknown!</div></div>
  }

  const toggleDlOptions = () => {
    setDlOptions(!dlOptions);
  }

  const resOptions = sortRes(Object.keys(files[baseKey]));
  const setResValue = v => {
    setRes(v.value)
    localStorage.setItem(`assetPref_${data.type}_resolution`, v.value)
  }
  const dlRes = resOptions.includes(prefRes) ? prefRes : resOptions.slice(-1)[0]

  const fmtOptions = isHDRI ? ['hdr', 'exr'] : ['blend', 'gltf'];
  const setFmtValue = v => {
    setFmt(v.value)
    localStorage.setItem(`assetPref_${data.type}_format`, v.value)
  }
  const dlFmt = fmtOptions.includes(prefFmt) ? prefFmt : (isHDRI ? 'hdr' : 'blend')

  let fsize = 0
  const fileInfo = files[isHDRI ? 'hdri' : dlFmt][dlRes][dlFmt]
  fsize = fileInfo.size
  if (fileInfo.include) {
    for (const i of Object.values(fileInfo.include)) {
      fsize += i['size']
    }
  }

  const downloadZip = async () => {
    if (busyDownloading) {
      return
    }
    setBusyDownloading(true)
    let dlFiles = []
    const fileInfo = files[dlFmt][dlRes][dlFmt]
    const name = urlBaseName(fileInfo.url)
    dlFiles.push({
      url: fileInfo.url,
      path: name
    })
    if (fileInfo.include) {
      for (const path of Object.keys(fileInfo.include)) {
        dlFiles.push({
          url: fileInfo.include[path].url,
          path: path
        })
      }
    }
    // testDownload(name, dlFiles)
    startDownload(name, dlFiles)

    await new Promise(r => setTimeout(r, 2000)).then(_ => {
      // Purely for a visual indication that something is happending, and to prevent accidental double clicks.
      setBusyDownloading(false)
    })
  }

  return (
    <div>
      <div className={styles.downloadBtnWrapper}>
        <Dropdown
          value={dlRes}
          options={resOptions}
          onChange={setResValue}
          small={true} />

        <Dropdown
          value={dlFmt}
          options={fmtOptions}
          onChange={setFmtValue}
          small={true} />

        <a
          href={isHDRI ? files['hdri'][dlRes][dlFmt].url : null}
          className={`${styles.downloadBtn} ${busyDownloading ? styles.disabled : null}`}
          onClick={isHDRI ? null : downloadZip}
        >
          <MdFileDownload />
          <div>
            <h3>Download</h3>
            <p>{filesize(fsize)}</p>
          </div>
          <div className={`${styles.busyDownloading} ${busyDownloading ? styles.show : null}`}><Loader /></div>
        </a>
        {isHDRI ? null :
          <div className={styles.downloadBtnSml} onClick={toggleDlOptions}>
            {dlOptions ? <MdArrowBack /> : <MdMenu />}
          </div>
        }
      </div>
      <DownloadOptions open={dlOptions} files={files} res={dlRes} format={dlFmt} />
    </div>
  )
}

export default Download
