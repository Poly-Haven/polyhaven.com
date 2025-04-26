import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import apiSWR from 'utils/apiSWR'

import DonationBox from 'components/DonationBox/DonationBox'
import Loader from 'components/UI/Loader/Loader'

import styles from './Roadmap.module.scss'
import { set } from 'date-fns'

const Roadmap = ({ mini }) => {
  const { t } = useTranslation('home')
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0)
  const [highestAchievedGoalIndex, setHighestAchievedGoalIndex] = useState(0)
  const [numPatrons, setNumPatrons] = useState(0)
  const [numPatronsToGo, setNumPatronsToGo] = useState(0)
  const [milestones, setMilestones] = useState([
    {
      text: 'Dummy milestone to make math easier',
      target: 1,
      achieved: '2000-01-01',
      link: '#',
      img: null,
    },
  ])

  // Fetch data from API
  const { data, error } = apiSWR('/milestones', { revalidateOnFocus: true })

  // Append data
  useEffect(() => {
    if (!error && data) {
      if (!numPatrons) {
        setNumPatrons(data.numPatrons)
      }
      const allMilestones = [milestones[0], ...data.milestones]
      setMilestones(allMilestones)

      let highestAchieved = 0
      for (let i = 0; i < allMilestones.length; i++) {
        if (allMilestones[i].achieved) {
          highestAchieved = i
        }
      }
      setHighestAchievedGoalIndex(highestAchieved)
      if (activeMilestoneIndex === 0) {
        // Default to the next milestone, but don't set if the active milestone has been changed
        setActiveMilestoneIndex(highestAchieved + 1)
        setNumPatronsToGo(allMilestones[highestAchieved + 1].target - data.numPatrons)
      }
    }
  }, [data, error])

  const maxTarget = milestones[milestones.length - 1].target
  const step = 80
  const progressBarPosition =
    highestAchievedGoalIndex > 1
      ? Math.max(
          Math.min(
            numPatrons,
            milestones[highestAchievedGoalIndex + 1]?.target
              ? milestones[highestAchievedGoalIndex + 1].target - step
              : milestones[highestAchievedGoalIndex].target
          ),
          milestones[highestAchievedGoalIndex].target
        ) / maxTarget
      : 0
  const targetBarPosition = activeMilestoneIndex > 1 ? milestones[activeMilestoneIndex].target / maxTarget : 0

  // Hover effect for the milestones
  const handleMouseEnter = (e, milestoneIndex) => {
    e.currentTarget.classList.add(styles.hover)
    if (milestoneIndex > highestAchievedGoalIndex) {
      setActiveMilestoneIndex(milestoneIndex)
      setNumPatronsToGo(milestones[milestoneIndex].target - numPatrons)
    }
  }
  const handleMouseLeave = (e, milestoneIndex) => {
    const target = e.currentTarget
    setTimeout(
      () => {
        if (!target.matches(':hover')) {
          target.classList.remove(styles.hover)
        }
      },
      milestoneIndex < highestAchievedGoalIndex - 1 ? 500 : 200
    )
  }

  return (
    <div className={mini ? styles.wrapperMini : styles.wrapper}>
      <div className={styles.wrapperInner}>
        <div className={styles.roadmapWrapper}>
          <h2 className={styles.topText}>Poly Haven Roadmap</h2>
          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barTarget} style={{ width: `calc(${targetBarPosition * 100}% - 4px)` }} />
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
                {mini && numPatrons && (
                  <div className={styles.barText}>
                    {Math.max(0, milestones[activeMilestoneIndex].target - numPatrons)} patrons to go!
                  </div>
                )}
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
                      m.achieved ? (highestAchievedGoalIndex === i + 1 ? styles.lastAchieved : styles.achieved) : ''
                    } ${i % 2 && !mini ? styles.flip : ''} ${i === 0 ? styles.first : ''}`}
                    style={{ right: i !== 0 ? `${100 - (m.target / maxTarget) * 100}%` : `calc(100% - 30px)` }}
                    onMouseEnter={(e) => handleMouseEnter(e, i + 1)}
                    onMouseLeave={(e) => handleMouseLeave(e, i + 1)}
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
                      <div className={styles.dotImg}>
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
          {mini && activeMilestoneIndex && milestones[activeMilestoneIndex] ? (
            <div className={styles.milestoneText}>
              {milestones[activeMilestoneIndex].img && (
                <div className={styles.icon}>
                  <img src={milestones[activeMilestoneIndex].img} />
                </div>
              )}
              <div className={`${styles.text} ${milestones[activeMilestoneIndex].text === '???' && styles.comingSoon}`}>
                <span>{milestones[activeMilestoneIndex].text}</span>
              </div>
              <div className={styles.target}>
                {milestones[activeMilestoneIndex].achieved || `${milestones[activeMilestoneIndex].target} patrons`}
              </div>
            </div>
          ) : (
            numPatrons > 0 && (
              <h3 className={styles.bottomText}>
                {numPatronsToGo > 0 && `${Math.max(0, numPatronsToGo)} to go! `}
                <Link href="https://www.patreon.com/polyhaven/overview">Join {numPatrons} patrons</Link>, support the
                future of free assets
              </h3>
            )
          )}
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
