import React, { useState } from 'react'

import { MdFileCopy } from 'react-icons/md'

import styles from './CopyCode.module.scss'

const CopyCode = ({ text, display }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 800)
  }

  return (
    <span className={`${styles.text} ${copied ? styles.copied : ''}`} onClick={handleCopy}>
      {display || text}
      <MdFileCopy className={styles.icon} />
    </span>
  )
}

CopyCode.defaultProps = {
  display: null,
}

export default CopyCode
