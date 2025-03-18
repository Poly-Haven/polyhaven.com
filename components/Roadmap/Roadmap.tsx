import { useTranslation } from 'next-i18next'

import { TbMoon, TbShirt, TbCamera, TbDrone, TbVolcano, TbTorii, TbCactus } from 'react-icons/tb'
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
      icon: <TbMoon />,
      target: 1,
      achieved: '2000-01-01',
      link: '',
    },
    {
      text: `HDRI Haven Launch`,
      icon: <TbMoon />,
      target: 0,
      achieved: '2017-10-03',
      link: 'https://x.com/GregZaal/status/915220428112711682',
    },
    {
      text: `Texture Haven Launch`,
      icon: <TbMoon />,
      target: 520,
      achieved: '2018-06-19',
      link: 'https://www.patreon.com/posts/texture-haven-19562868',
    },
    {
      text: `3D Model Haven Launch`,
      icon: <TbMoon />,
      target: 740,
      achieved: '2020-03-31',
      link: 'https://www.patreon.com/posts/3d-model-haven-30626137',
    },
    {
      text: `Poly Haven Launch`,
      icon: <TbMoon />,
      target: 900,
      achieved: '2021-06-15',
      link: 'https://www.patreon.com/posts/polyhaven-com-is-52567161',
    },
    {
      text: `The Smuggler's Cove`,
      icon: <TbMoon />,
      target: 1000,
      achieved: '2022-01-13',
      link: 'https://www.indiegogo.com/projects/the-smuggler-s-cove-a-17th-century-asset-pack#/updates/all',
    },
    {
      text: 'A Verdant Trail',
      icon: <TbMoon />,
      target: 1300,
      achieved: '2024-02-05',
      link: 'https://polyhaven.com/collections/verdant_trail',
    },
    {
      text: 'Namaqualand',
      icon: <TbMoon />,
      target: 1400,
      achieved: '2024-10-08',
      link: 'https://polyhaven.com/collections/namaqualand',
    },
    {
      text: 'Moon Vault',
      icon: <TbMoon />,
      target: 1600,
      achieved: '2025-02-01',
      link: '',
    },
    {
      text: 'Fabric Vault',
      icon: <TbShirt />,
      target: 1800,
      link: '',
    },
    {
      text: 'Studio HDRIs',
      icon: <TbCamera />,
      target: 2050,
      link: '',
    },
    {
      text: 'Wood Vault',
      icon: <GiWoodBeam />,
      target: 2350,
      link: '',
    },
    {
      text: '???',
      icon: <TbDrone />,
      target: 2650,
      link: '',
    },
    {
      text: '???',
      icon: <TbCactus />,
      target: 3000,
      link: '',
    },
    {
      text: '???',
      icon: <TbTorii />,
      target: 3300,
      link: '',
    },
    {
      text: '???',
      icon: <TbVolcano />,
      target: 3600,
      link: '',
    },
    {
      text: 'Free the Add-on',
      icon: <Blender />,
      target: 3750,
      link: '',
    },
  ]

  const currentPatrons = 1689 // TODO get from API
  let highestAchievedGoal = 0 // Index of the highest achieved goal
  for (const m of milestones) {
    if (m.achieved) {
      highestAchievedGoal = milestones.indexOf(m)
    }
  }
  const maxTarget = milestones[milestones.length - 1].target
  const step = 80
  const progressBarPosition =
    Math.max(
      Math.min(currentPatrons, milestones[highestAchievedGoal + 1].target - step),
      milestones[highestAchievedGoal].target
    ) / maxTarget

  return (
    <div className={styles.wrapper}>
      {/* <div className={styles.newestPatrons}>
        <h4>{t('s4')}</h4>
        <LatestPatrons />
        <div className={styles.fade} />
      </div> */}
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
                    className={`${styles.milestone} ${
                      m.achieved ? (highestAchievedGoal === i + 1 ? styles.lastAchieved : styles.achieved) : ''
                    } ${i % 2 ? styles.flip : ''}`}
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
                    <div className={styles.milestoneText}>
                      <div className={styles.icon}>{m.icon}</div>
                      <div className={`${styles.text} ${m.text === '???' ? styles.comingSoon : ''}`}>
                        <span>{m.text}</span>
                      </div>
                      {m.achieved ? (
                        <div className={styles.target}>{m.achieved}</div>
                      ) : (
                        <div className={styles.target}>{m.target} patrons</div>
                      )}
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
      {/* <div>
        <RoadmapCorporateSponsors />
      </div> */}
    </div>
  )
}

export default Roadmap
