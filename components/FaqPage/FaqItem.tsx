import styles from './FaqPage.module.scss'

const FaqItem = ({ question, children }) => {
  return (
    <div className={styles.faq}>
      <h2>{question}</h2>
      {children}
    </div>
  )
}

export default FaqItem
