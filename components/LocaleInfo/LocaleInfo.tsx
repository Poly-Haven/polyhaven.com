import LocaleFlag from "components/Layout/Header/Nav/LocaleFlag"

import styles from './LocaleInfo.module.scss'

const LocaleInfo = ({ locale, flag, name, translation_progress }) => {
  let progress = -1
  let credits = {}

  if (translation_progress) {
    progress = 0
    if (translation_progress[locale]) {
      progress = translation_progress[locale].progress
      if (translation_progress[locale].credits) {
        credits = translation_progress[locale].credits
      }
    }
  }

  let status = <span>Loading...</span>
  if (progress === 100) {
    status = <span>Complete!</span>
  } else if (progress > 10) {
    status = <span>In progress...</span>
  } else {
    status = <strong><span className="text-red">Needs help!</span></strong>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <LocaleFlag locale={locale} flag={flag} />
        <div className={styles.text}>
          <h3>{name}</h3>
          {credits ?
            <p>{Object.keys(credits).map(c =>
              <span key={c} className={styles.credit}>{credits[c] ? <a href={credits[c]} rel="nofollow noopener" target="_blank">{c}</a> : c}</span>
            )}</p>
            : null}
        </div>
      </div>
      <div className={styles.status}>
        <div className={styles.statusInner} style={{ width: `${Math.max(0, progress)}%` }} />
        <em>{status}</em>
        <div className={styles.spacer} />
        <em>{progress}%</em>
      </div>
    </div>
  )
}

export default LocaleInfo