import { useState } from 'react'

import { MdFileDownload, MdTune, MdArrowBack } from 'react-icons/md'

import Dropdown from 'components/UI/Dropdown/Dropdown';
import DownloadOptions from './DownloadOptions'

import styles from './Download.module.scss'

const Download = () => {
  const [dlOptions, setDlOptions] = useState(false)
  const [dlRes, setRes] = useState('4k')

  const toggleDlOptions = () => {
    setDlOptions(!dlOptions);
  }

  const resOptions = ['1k', '2k', '4k', '8k'];
  const setResValue = v => {
    setRes(v.value)
  }

  return (
    <div>
      <div className={styles.downloadBtnWrapper}>
        <Dropdown
          value={dlRes}
          options={resOptions}
          onChange={setResValue}
          small={true} />

        <div id="download-btn" className={styles.downloadBtn}>
          <MdFileDownload />
          <div>
            <h3>Download</h3>
            <p>blend • {dlRes} • 24MB</p>
          </div>
        </div>
        <div className={styles.downloadBtnSml} onClick={toggleDlOptions}>
          {dlOptions ? <MdArrowBack /> : <MdTune />}
        </div>
      </div>
      <DownloadOptions open={dlOptions} />
    </div>
  )
}

export default Download
