import { useRouter } from 'next/router'

import { MdLink } from 'react-icons/md'

import styles from './FaqPage.module.scss'

const FaqItem = ({ question, qID, activeQ, children }) => {
  const router = useRouter()

  const click = (e) => {
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, q: e.currentTarget.dataset.qid },
      },
      undefined,
      { shallow: true }
    )
  }

  const highlight = activeQ && activeQ === qID
  return (
    <div className={`${styles.faq} ${highlight ? styles.highlight : ''}`}>
      <a id={qID} className={styles.anchor} />
      <h2>
        <span onClick={click} data-qid={qID}>
          <MdLink />
        </span>{' '}
        {question}
      </h2>
      {children}
    </div>
  )
}

export default FaqItem
