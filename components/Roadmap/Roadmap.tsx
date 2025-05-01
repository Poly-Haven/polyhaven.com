import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import apiSWR from 'utils/apiSWR'

import { GoLinkExternal } from 'react-icons/go'

import DonationBox from 'components/DonationBox/DonationBox'
import Loader from 'components/UI/Loader/Loader'

import styles from './Roadmap.module.scss'

const Milestone = ({ milestone, active, achieved }) => {
  const Comp = active || achieved ? Link : 'div'

  return (
    <Comp href={milestone.link} className={styles.milestoneText}>
      {milestone.img && (
        <div className={styles.icon}>
          <img src={milestone.text === '???' ? 'https://cdn.polyhaven.com/vaults/icons/question.svg' : milestone.img} />
        </div>
      )}
      <div className={`${styles.text} ${milestone.text === '???' && styles.comingSoon}`}>
        <span>
          {milestone.text.replace('???', '')}{' '}
          <sup>
            <GoLinkExternal />
          </sup>
        </span>
      </div>
      <div className={styles.target}>{milestone.achieved || `${milestone.target} patrons`}</div>
    </Comp>
  )
}

const Roadmap = ({ mini, vaults }) => {
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
      // allMilestones[9].achieved = '2023-10-01' // DEBUG
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

  const handleClick = (e, milestoneIndex) => {
    if (milestoneIndex > highestAchievedGoalIndex) {
      setActiveMilestoneIndex(milestoneIndex)
      setNumPatronsToGo(milestones[milestoneIndex].target - numPatrons)
    }
  }
  const handleMouseEnter = (e, milestoneIndex) => {
    if (milestoneIndex <= highestAchievedGoalIndex) {
      e.currentTarget.classList.add(styles.hover)
    }
  }
  const handleMouseLeave = (e, milestoneIndex) => {
    const target = e.currentTarget
    setTimeout(() => {
      if (!target.matches(':hover')) {
        target.classList.remove(styles.hover)
      }
    }, 500)
  }

  return (
    <div className={mini ? styles.wrapperMini : styles.wrapper}>
      <div className={styles.wrapperInner}>
        <div className={styles.roadmapWrapper}>
          <h2 className={styles.topText}>{vaults ? "What's Next?" : 'Poly Haven Roadmap'}</h2>
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
                  <div
                    key={i}
                    className={`${styles.milestone} ${activeMilestoneIndex === i + 1 ? styles.active : ''} ${
                      m.achieved ? (highestAchievedGoalIndex === i + 1 ? styles.lastAchieved : styles.achieved) : ''
                    } ${i % 2 && !mini ? styles.flip : ''} ${i === 0 ? styles.first : ''}`}
                    style={{ right: i !== 0 ? `${100 - (m.target / maxTarget) * 100}%` : `calc(100% - 30px)` }}
                    onClick={(e) => handleClick(e, i + 1)}
                    onMouseEnter={(e) => handleMouseEnter(e, i + 1)}
                    onMouseLeave={(e) => handleMouseLeave(e, i + 1)}
                  >
                    {!mini && (
                      <Milestone
                        milestone={m}
                        active={activeMilestoneIndex === i + 1}
                        achieved={i + 1 <= highestAchievedGoalIndex}
                      />
                    )}
                    {!mini && <div className={styles.arrow} />}
                    {mini && m.img ? (
                      <div className={`${styles.dotImg} ${activeMilestoneIndex === i + 1 && styles.activeDot}`}>
                        <img src={m.text === '???' ? 'https://cdn.polyhaven.com/vaults/icons/question.svg' : m.img} />
                      </div>
                    ) : (
                      <div className={styles.dot} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {mini && activeMilestoneIndex && milestones[activeMilestoneIndex] ? (
            <Link
              href={milestones[activeMilestoneIndex].link}
              className={`${styles.activeMilestoneText} ${
                milestones[activeMilestoneIndex].text === '???' && styles.comingSoon
              }`}
            >
              <div className={styles.text}>
                <span>{milestones[activeMilestoneIndex].text.replace('???', 'To be announced')}</span>
              </div>
              <div className={styles.target}>
                {numPatrons} /{' '}
                {milestones[activeMilestoneIndex].achieved || `${milestones[activeMilestoneIndex].target} patrons`}
              </div>
            </Link>
          ) : (
            numPatrons > 0 && (
              <div className={styles.bottomText}>
                <h3>{numPatronsToGo} patrons to go!</h3>
                <p>
                  <Link href="https://www.patreon.com/polyhaven/overview">Join {numPatrons} other patrons</Link>,
                  support the future of free assets.
                </p>
              </div>
            )
          )}
        </div>
        {!mini && !vaults && <DonationBox />}
      </div>
    </div>
  )
}

Roadmap.defaultProps = {
  mini: false,
  vaults: false,
}

export default Roadmap
