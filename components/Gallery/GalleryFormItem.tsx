import React from 'react'

import styles from './GallerySubmit.module.scss'

const GalleryFormItem = ({ label, description, optional, children }) => {
  return (
    <div className={styles.formItem}>
      <div className={styles.row}>
        <span className={styles.label}>{label}:</span>
        {children}
        {optional ? <em>(optional)</em> : null}
      </div>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

GalleryFormItem.defaultProps = {
  description: null,
  optional: false,
}

export default GalleryFormItem