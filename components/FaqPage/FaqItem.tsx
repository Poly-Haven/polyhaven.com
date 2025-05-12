import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import styles from './FaqPage.module.scss'

const FaqItem = ({ question, qID, activeQ, main, children }) => {
  const router = useRouter()
  const [isHighlighted, setIsHighlighted] = useState(false)

  useEffect(() => {
    if (activeQ === qID) {
      setIsHighlighted(true)
      setTimeout(() => {
        setIsHighlighted(false) // Remove the highlight after 3 seconds
        setTimeout(() => {
          // Remove the ?q from the URL after 3 seconds
          router.push(
            {
              pathname: router.pathname,
            },
            undefined,
            { shallow: true }
          )
        }, 3000)
      }, 3000)
    }
  }, [activeQ, qID])

  const click = (e) => {
    e.preventDefault() // Prevent the default link behavior
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, q: e.currentTarget.dataset.qid },
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <div className={`${styles.faq} ${isHighlighted ? styles.highlight : ''} ${main ? styles.main : ''}`}>
      <a id={qID} className={styles.anchor} />
      <h2>
        <a href={`${router.pathname}?q=${qID}`} onClick={click} data-qid={qID}>
          {question}
        </a>
      </h2>
      {children}
    </div>
  )
}
FaqItem.defaultProps = {
  main: false,
}

export default FaqItem
