import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslation, Trans } from 'next-i18next'
import apiSWR from 'utils/apiSWR'
import useDivSize from 'hooks/useDivSize'

import { GoLinkExternal } from 'react-icons/go'

import DonationBox from 'components/DonationBox/DonationBox'
import Loader from 'components/UI/Loader/Loader'

import styles from './Roadmap.module.scss'

const Milestone = ({ milestone, active, achieved }) => {
  const { t } = useTranslation(['common'])
  const Comp = active || achieved ? Link : 'div'

  return (
    <Comp href={milestone.link} className={styles.milestoneText}>
      {milestone.img && (
        <div className={styles.icon}>
          <img src={milestone.text === '???' ? 'https://cdn.polyhaven.com/vaults/icons/question.svg' : milestone.img} />
        </div>
      )}
      <div
        className={`${styles.text} ${milestone.text === '???' && styles.comingSoon}`}
        data-soon={t('common:roadmap.to-be-announced')}
      >
        <span>
          {milestone.text.replace('???', '')}{' '}
          <sup>
            <GoLinkExternal />
          </sup>
        </span>
      </div>
      <div className={styles.target}>
        {milestone.achieved || t('common:roadmap.target-patrons', { target: milestone.target })}
      </div>
    </Comp>
  )
}

const Roadmap = ({ mini, vaults, addon }) => {
  const { t } = useTranslation(['common'])
  const widthRef = useRef(null)
  const { width: divWidth } = useDivSize(widthRef)
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

  const isMobile = divWidth <= 600

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
        setActiveMilestoneIndex(addon ? allMilestones.length - 1 : highestAchieved + 1)
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
    <div className={mini || isMobile ? styles.wrapperMini : styles.wrapper} ref={widthRef}>
      <div className={styles.wrapperInner}>
        <div className={styles.roadmapWrapper}>
          <h2 className={styles.topText}>{vaults ? t('common:roadmap.whats-next') : t('common:roadmap.title')}</h2>
          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barTarget} style={{ width: `calc(${targetBarPosition * 100}% - 4px)` }} />
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
                {(mini || isMobile) && numPatrons && (
                  <div className={styles.barText}>
                    {t('common:n-patrons-to-go', {
                      number: Math.max(0, milestones[activeMilestoneIndex].target - numPatrons),
                    })}
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
                    } ${i % 2 && !(mini || isMobile) ? styles.flip : ''} ${i === 0 ? styles.first : ''}`}
                    style={{ right: i !== 0 ? `${100 - (m.target / maxTarget) * 100}%` : `calc(100% - 30px)` }}
                    onClick={(e) => handleClick(e, i + 1)}
                    onMouseEnter={(e) => handleMouseEnter(e, i + 1)}
                    onMouseLeave={(e) => handleMouseLeave(e, i + 1)}
                  >
                    {!(mini || isMobile) && (
                      <Milestone
                        milestone={m}
                        active={activeMilestoneIndex === i + 1}
                        achieved={i + 1 <= highestAchievedGoalIndex}
                      />
                    )}
                    {!(mini || isMobile) && <div className={styles.arrow} />}
                    {(mini || isMobile) && m.img ? (
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
          {(mini || isMobile) && activeMilestoneIndex && milestones[activeMilestoneIndex] ? (
            <Link
              href={milestones[activeMilestoneIndex].link}
              className={`${styles.activeMilestoneText} ${
                milestones[activeMilestoneIndex].text === '???' && styles.comingSoon
              }`}
            >
              <div className={styles.text}>
                <span>{milestones[activeMilestoneIndex].text.replace('???', t('common:roadmap.to-be-announced'))}</span>
              </div>
              <div className={styles.target}>
                {numPatrons} /{' '}
                {milestones[activeMilestoneIndex].achieved ||
                  t('common:roadmap.target-patrons', { target: milestones[activeMilestoneIndex].target })}
              </div>
            </Link>
          ) : (
            numPatrons > 0 && (
              <div className={styles.bottomText}>
                <h3>{t('common:n-patrons-to-go', { number: numPatronsToGo })}</h3>
                <p>
                  <Trans
                    i18nKey="common:roadmap.join-support"
                    t={t}
                    values={{ numPatrons }}
                    components={{ patreonLink: <Link href="https://www.patreon.com/polyhaven/overview" /> }}
                  />
                </p>
              </div>
            )
          )}
        </div>
        {!(mini || isMobile) && !vaults && divWidth > 1100 && <DonationBox />}
      </div>
      {!(mini || isMobile) && !vaults && divWidth <= 1100 && (
        <div className={styles.center}>
          <DonationBox />
        </div>
      )}
    </div>
  )
}

Roadmap.defaultProps = {
  mini: false,
  vaults: false,
  addon: false,
}

export default Roadmap
