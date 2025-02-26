import { useTranslation } from 'next-i18next'

import { IoMdLock } from 'react-icons/io'
import { TbMoon, TbShirt, TbCamera, TbDrone, TbVolcano, TbTorii } from 'react-icons/tb'
import { GiWoodBeam } from 'react-icons/gi'
import Blender from 'components/UI/Icons/Blender'

import DonationBox from 'components/DonationBox/DonationBox'
import RoadmapCorporateSponsors from './RoadmapCorporateSponsors'
import LatestPatrons from 'components/Home/LatestPatrons'

import styles from './Roadmap.module.scss'

const Roadmap = () => {
  const { t } = useTranslation('home')
  const milestones = [
    // TODO get from API
    {
      text: 'Dummy milestone to make math easier',
      icon: <IoMdLock />,
      target: 1,
      achieved: '2020-01-01',
    },
    {
      text: 'Moon Vault',
      icon: <TbMoon />,
      target: 1600,
      achieved: '2024-02-01',
    },
    // {
    //   text: 'Remove 1/4 Ads',
    //   icon: <IoMdLock />,
    //   target: 1750,
    //   achieved: false,
    // },
    {
      text: 'Fabric Vault',
      icon: <TbShirt />,
      target: 1750,
    },
    // {
    //   text: 'Remove 2/4 Ads',
    //   icon: <IoMdLock />,
    //   target: 1850,
    // },
    {
      text: 'Remove Ads',
      icon: <IoMdLock />,
      target: 2000,
    },
    {
      text: 'Studio HDRIs',
      icon: <TbCamera />,
      target: 2200,
    },
    // {
    //   text: 'Remove 3/4 Ads',
    //   icon: <IoMdLock />,
    //   target: 2000,
    // },
    {
      text: 'Wood Vault',
      icon: <GiWoodBeam />,
      target: 2500,
    },
    // {
    //   text: 'Remove All Ads',
    //   icon: <IoMdLock />,
    //   target: 2100,
    // },
    {
      text: '???',
      icon: <TbDrone />,
      target: 2800,
    },
    {
      text: '???',
      icon: <TbTorii />,
      target: 3200,
    },
    {
      text: '???',
      icon: <TbVolcano />,
      target: 3600,
    },
    {
      text: 'Free the Add-on',
      icon: <Blender />,
      target: 3700,
    },
  ]

  const currentPatrons = 1615 // TODO get from API
  let highestAchievedGoal = 0 // Index of the highest achieved goal
  for (const m of milestones) {
    if (m.achieved) {
      highestAchievedGoal = milestones.indexOf(m)
    }
  }
  const step = 380
  const progressBarPosition =
    Math.max(
      Math.min(currentPatrons, milestones[highestAchievedGoal + 1].target - step),
      milestones[highestAchievedGoal].target
    ) / 3700

  return (
    <div className={styles.wrapper}>
      <div className={styles.newestPatrons}>
        <h4>{t('s4')}</h4>
        <LatestPatrons />
        <div className={styles.fade} />
      </div>
      <div className={styles.wrapperInner}>
        <div className={styles.roadmapWrapper}>
          <h2 className={styles.topText}>Poly Haven Roadmap</h2>
          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
              </div>
              <div className={styles.milestones}>
                {milestones.slice(1).map((m, i) => (
                  <div
                    key={i}
                    className={`${styles.milestone} ${m.achieved ? styles.achieved : ''} ${i % 2 ? styles.flip : ''}`}
                    style={{ right: `${100 - (m.target / 3700) * 100}%` }}
                  >
                    <div className={styles.milestoneText}>
                      <div className={styles.icon}>{m.icon}</div>
                      <div className={`${styles.text} ${m.text === '???' ? styles.comingSoon : ''}`}>
                        <span>{m.text}</span>
                      </div>
                      <div className={styles.target}>{m.target} patrons</div>
                      {m.achieved ? <div className={styles.target}>Reached on {m.achieved}</div> : null}
                    </div>
                    <div className={styles.arrow} />
                    <div className={styles.dot} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <h3 className={styles.bottomText}>Join {currentPatrons} patrons, support the future of free assets</h3>
        </div>
        <DonationBox />
      </div>
      <div>
        <RoadmapCorporateSponsors />
      </div>
    </div>
  )
}

export default Roadmap
