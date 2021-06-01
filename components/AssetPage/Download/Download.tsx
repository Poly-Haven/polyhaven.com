import { useEffect } from "react";
import { useState } from 'react'
import filesize from 'filesize'

import { MdFileDownload, MdMenu, MdArrowBack } from 'react-icons/md'

import Dropdown from 'components/UI/Dropdown/Dropdown';
import DownloadOptions from './DownloadOptions'
import Loader from 'components/UI/Loader/Loader'

import { sortRes } from 'utils/arrayUtils'
import apiSWR from 'utils/apiSWR'

import styles from './Download.module.scss'

const Download = ({ assetID, data }) => {
  const [dlOptions, setDlOptions] = useState(false)
  const [prefRes, setRes] = useState('4k')
  const [prefFmt, setFmt] = useState('exr')

  useEffect(() => {
    setRes(localStorage.getItem(`assetPref_${data.type}_resolution`) || '4k')
    setFmt(localStorage.getItem(`assetPref_${data.type}_format`) || 'exr')
  });

  const { data: files, error } = apiSWR(`/files/${assetID}`, { revalidateOnFocus: false });
  if (error) {
    return <div><div id="download-btn" className={styles.downloadBtn}>Error!</div></div>
  } else if (!files) {
    return <div><div id="download-btn" className={styles.downloadBtn}><Loader /></div></div>
  }

  // Find a key that we can use to fetch available resolutions and formats.
  let baseKey = 'UNKNOWN'
  const baseKeys = ['HDRI', 'Diffuse', 'nor_gl', 'Rough', 'Displacement']
  for (const k of baseKeys) {
    if (Object.keys(files).includes(k)) {
      baseKey = k
      break;
    }
  }
  if (baseKey === 'UNKNOWN') {
    return <div><div id="download-btn" className={styles.downloadBtn}>baseKey unknown!</div></div>
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

  const fmtOptions = data.type === 0 ? ['hdr', 'exr'] : ['blend', 'gltf', 'zip'];
  const setFmtValue = v => {
    setFmt(v.value)
    localStorage.setItem(`assetPref_${data.type}_format`, v.value)
  }
  const dlFmt = fmtOptions.includes(prefFmt) ? prefFmt : (data.type === 0 ? 'hdr' : 'blend')

  let fsize = 0
  if (data.type !== 0) {
    const fileInfo = files[dlFmt][dlRes][dlFmt]
    fsize = fileInfo.size
    if (fileInfo.include) {
      for (const i of Object.values(fileInfo.include)) {
        fsize += i['size']
      }
    }
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

        <div id="download-btn" className={styles.downloadBtn}>
          <MdFileDownload />
          <div>
            <h3>Download</h3>
            <p>{filesize(fsize)}</p>
          </div>
        </div>
        <div className={styles.downloadBtnSml} onClick={toggleDlOptions}>
          {dlOptions ? <MdArrowBack /> : <MdMenu />}
        </div>
      </div>
      <DownloadOptions open={dlOptions} files={files} res={dlRes} format={dlFmt} />
    </div>
  )
}

export default Download
