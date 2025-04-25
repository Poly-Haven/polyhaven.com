import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import apiSWR from 'utils/apiSWR'

import DonationBox from 'components/DonationBox/DonationBox'
import Loader from 'components/UI/Loader/Loader'

import styles from './Roadmap.module.scss'

const Roadmap = ({ mini }) => {
  const { t } = useTranslation('home')

  let milestones = [
    {
      text: 'Dummy milestone to make math easier',
      target: 1,
      achieved: '2000-01-01',
      link: '#',
      img: null,
    },
  ]
  let numPatrons = 0

  // Fetch data from API
  const { data, error } = apiSWR('/milestones', { revalidateOnFocus: true })

  // Append data
  if (!error && data) {
    numPatrons = data.numPatrons
    for (const m of data.milestones) {
      milestones.push(m)
    }
  }

  let highestAchievedGoal = 0 // Index of the highest achieved goal
  for (const m of milestones) {
    if (m.achieved) {
      highestAchievedGoal = milestones.indexOf(m)
    }
  }
  const maxTarget = milestones[milestones.length - 1].target
  const step = 80
  const progressBarPosition =
    milestones.length <= 1
      ? 0
      : Math.max(
          Math.min(numPatrons, milestones[highestAchievedGoal + 1].target - step),
          milestones[highestAchievedGoal].target
        ) / maxTarget

  return (
    <div className={mini ? styles.wrapperMini : styles.wrapper}>
      <div className={styles.wrapperInner}>
        <div className={styles.roadmapWrapper}>
          <h2 className={styles.topText}>Poly Haven Roadmap</h2>
          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
              </div>
              {milestones.length <= 1 && (
                <div className={styles.loader}>
                  <Loader />
                </div>
              )}
              <div className={styles.milestones}>
                {milestones.slice(1).map((m, i) => (
                  <Link
                    key={i}
                    href={m.link}
                    className={`${styles.milestone} ${
                      m.achieved ? (highestAchievedGoal === i + 1 ? styles.lastAchieved : styles.achieved) : ''
                    } ${i % 2 && !mini ? styles.flip : ''} ${i === 0 ? styles.first : ''}`}
                    style={{ right: i !== 0 ? `${100 - (m.target / maxTarget) * 100}%` : `calc(100% - 30px)` }}
                    onMouseEnter={(e) => e.currentTarget.classList.add(styles.hover)}
                    onMouseLeave={(e) => {
                      const target = e.currentTarget
                      setTimeout(
                        () => {
                          if (!target.matches(':hover')) {
                            target.classList.remove(styles.hover)
                          }
                        },
                        i < highestAchievedGoal - 1 ? 500 : 200
                      )
                    }}
                  >
                    {!mini && (
                      <div className={styles.milestoneText}>
                        {m.img && (
                          <div className={styles.icon}>
                            <img src={m.img} />
                          </div>
                        )}
                        <div className={`${styles.text} ${m.text === '???' && styles.comingSoon}`}>
                          <span>{m.text}</span>
                        </div>
                        <div className={styles.target}>{m.achieved || `${m.target} patrons`}</div>
                      </div>
                    )}
                    {!mini && <div className={styles.arrow} />}
                    {mini && m.img ? (
                      <div
                        className={styles.dotImg}
                        title={
                          m.text.replace('???', 'Coming soon!') +
                          '\n' +
                          (m.achieved || `${numPatrons} / ${m.target} patrons`)
                        }
                      >
                        <img src={m.img} />
                      </div>
                    ) : (
                      <div className={styles.dot} />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <h3 className={styles.bottomText}>Join {numPatrons} patrons, support the future of free assets</h3>
        </div>
        {!mini && <DonationBox />}
      </div>
    </div>
  )
}

Roadmap.defaultProps = {
  mini: false,
}

export default Roadmap
