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

  const sortedCredits = Object.keys(credits).length ? Object.keys(credits).sort((a, b) => credits[a].localeCompare(credits[b])) : []

  let status = <span>Loading...</span>
  if (progress === 100) {
    status = <span>Complete!</span>
  } else if (progress > 40) {
    status = <span>In progress...</span>
  } else if (progress === -1) {
    status = <span>Loading...</span>
  } else {
    status = <strong><span>Needs help!</span></strong>
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <LocaleFlag locale={locale} flag={flag} />
        <div className={styles.text}>
          <h3>{name}</h3>
          {credits ?
            <p>{sortedCredits.map(c =>
              <span key={c} className={styles.credit}>{credits[c] ? <a href={credits[c]} rel="nofollow noopener" target="_blank">{c}</a> : c}</span>
            )}</p>
            : null}
        </div>
      </div>
      <div className={styles.status}>
        <div className={`${styles.statusInner} ${progress === 100 ? styles.statusComplete : ''} ${progress <= 40 ? styles.statusHelp : ''}`} style={{ width: `${Math.max(0, progress)}%` }} />
        <em>{status}</em>
        <div className={styles.spacer} />
        {progress >= 0 ? <em>{progress}%</em> : null}
      </div>
    </div>
  )
}

export default LocaleInfo