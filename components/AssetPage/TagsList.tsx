import { useTranslation } from 'next-i18next'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import useDivSize from 'hooks/useDivSize'

import InfoItem from './InfoItem'
import styles from './AssetPage.module.scss'

const TagsList = ({ label, list, linkPrefix, width }) => {
  const { t } = useTranslation('categories')
  const [expand, setExpand] = useState(false)
  const parentWidthRef = useRef(null)
  const widthRef = useRef(null)
  const { width: parentWidth } = useDivSize(parentWidthRef)
  const { width: divWidth } = useDivSize(widthRef)

  useEffect(() => {
    if (divWidth < parentWidth) {
      setExpand(true)
    }
  }, [parentWidth, divWidth])

  return (
    <div>
      <InfoItem label={label} flex={!expand}>
        <div className={`${styles.tagsListWrapper} ${expand ? styles.wrap : null}`} ref={parentWidthRef}>
          <div className={`${styles.tagsList} ${expand ? styles.wrap : null}`} ref={widthRef}>
            {list.map((i) => (
              <Link href={`${linkPrefix}${i}`} key={i}>
                <a>
                  <div className={styles.tag}>{t(i)}</div>
                </a>
              </Link>
            ))}
          </div>
        </div>
        {!expand ? (
          <div className={styles.expand} onClick={(_) => setExpand(true)}>
            ...
          </div>
        ) : null}
      </InfoItem>
    </div>
  )
}

export default TagsList
