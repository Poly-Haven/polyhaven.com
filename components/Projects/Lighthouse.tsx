import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import apiSWR from 'utils/apiSWR'

import Button from 'components/UI/Button/Button'
import Countdown from 'components/UI/Countdown/Countdown'
import Spinner from 'components/UI/Spinner/Spinner'
import PrizeCard from './PrizeCard'
import LighthouseTimeline from './LighthouseTimeline'

import styles from './Lighthouse.module.scss'

// Steam store page, used by the "Wishlist on Steam" CTA below.
const STEAM_URL = 'https://store.steampowered.com/app/4162610/Project_Lighthouse/'

const steamIntro = [
  `When the Static Rock lighthouse goes dark and contact with its "keepers" is lost, you're sent to restore its functionality.`,
  `But the simple repair job quickly spirals out of control, leaving you trapped in an experiment gone wrong.`,
  `As the truth unfolds, you'll find that the lighthouse hides more than its beam reveals.`,
]

const steamFeatures = [
  {
    title: `Control Teleportation`,
    video: 'https://u.polyhaven.org/xp4/Cam_04_15fps.mp4',
    text: `Discover the attributes of an evolving technology as you manipulate your surroundings to solve spatial puzzles.`,
  },
  {
    title: `Explore Static Rock Island`,
    video: 'https://u.polyhaven.org/9vs/Cam_01_15fps.mp4',
    text: `Traverse crumbling military ruins, explore labyrinths of secret labs, and ascend the iconic lighthouse as you progress through the atmospheric island.`,
  },
  {
    title: `Find the "Keepers"`,
    video: 'https://u.polyhaven.org/0M3/Cam_05_15fps.mp4',
    text: `The island inhabitants are gone. The secrets they held still remain. Delve into the lingering mystery behind a teleportation experiment as you find a way to leave the island.`,
  },
]

const WishlistCTA = () => (
  <div className={styles.wishlistCta}>
    <h2 className={styles.comingSoon}>Coming Q1 2027</h2>
    <a href={STEAM_URL} className={styles.wishlistNow}>
      Wishlist now.
    </a>
    <p>
      Whether you're here for the game or for the free assets it funds, hitting that <a href={STEAM_URL}>wishlist</a>{' '}
      button is the most helpful click you've got. It helps Steam decide which games deserve attention.
    </p>
    <p>We'll email you on launch day {'<3'}</p>
    <Button text="Wishlist on Steam" href={STEAM_URL} color="community" />
  </div>
)

const Lighthouse = () => {
  const submissionDeadline = '2026-05-01T23:59:59.999Z'
  const currentTime = new Date().toISOString()
  const isBeforeDeadline = currentTime < submissionDeadline

  const { data: allPrizes, error: errorPrizes } = apiSWR(`/community_prizes`, { revalidateOnFocus: false })
  const [prizes, setPrizes] = useState<any[]>([])
  useEffect(() => {
    if (allPrizes?.['project_lighthouse']) {
      const lighthousePrizes = Object.entries(allPrizes['project_lighthouse'])
        .map(([key, prize]) => ({ key, ...(prize as object) }))
        .sort(
          (a: any, b: any) =>
            parseFloat((b.value.match(/[\d.]+/) || ['0'])[0]) - parseFloat((a.value.match(/[\d.]+/) || ['0'])[0])
        )
      setPrizes(lighthousePrizes)
    }
  }, [allPrizes])

  // Animate the "Join the Project" collage in a smooth circular orbit. A keyframed
  // CSS version only approximates a circle (polygon facets) or won't recompute
  // background-position from an animated angle, so we drive cos/sin per-frame here.
  // The tunables (--orbit-radius / --orbit-speed) still live in the SCSS.
  const joinBgRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = joinBgRef.current
    if (!el || typeof window === 'undefined') return

    const style = getComputedStyle(el)
    const radius = parseFloat(style.getPropertyValue('--orbit-radius')) || 3000
    const speedSeconds = parseFloat(style.getPropertyValue('--orbit-speed')) || 120
    const durationMs = Math.max(1000, speedSeconds * 1000)

    const setPos = (angle: number) => {
      el.style.setProperty('--orbit-x', `${(Math.cos(angle) * radius).toFixed(2)}px`)
      el.style.setProperty('--orbit-y', `${(Math.sin(angle) * radius).toFixed(2)}px`)
    }

    // Reduced-motion: hold a static position, no loop.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPos(0)
      return
    }

    let rafId = 0
    let lastTs = 0
    let elapsed = 0 // ms of orbit progressed (accumulates only while visible)

    const frame = (ts: number) => {
      if (lastTs) elapsed += ts - lastTs
      lastTs = ts
      setPos((elapsed / durationMs) * Math.PI * 2)
      rafId = requestAnimationFrame(frame)
    }
    const start = () => {
      if (rafId) return
      lastTs = 0 // avoid a jump when resuming after being scrolled away
      rafId = requestAnimationFrame(frame)
    }
    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
    }

    setPos(0) // initial position before the first frame paints
    // Only run while the section is on-screen (saves CPU/battery when scrolled away).
    const observer = new IntersectionObserver((entries) => (entries[0].isIntersecting ? start() : stop()), {
      threshold: 0,
    })
    observer.observe(el)

    return () => {
      stop()
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div className={styles.pageBackground} />
      <div className={styles.pageWrapper}>
        <div className={styles.banner}>
          <div className={styles.video}>
            <video
              className={styles.backgroundVideo}
              autoPlay
              loop
              muted
              playsInline
              poster={`https://cdn.polyhaven.com/site_images/projects/lighthouse/feature.jpg?width=1920&quality=95`}
            >
              <source src="https://u.polyhaven.org/Ni3/lighthouse_bg.mp4" type="video/mp4" />
            </video>
          </div>
          <img
            src="https://cdn.polyhaven.com/site_images/logo/community.png?width=256&quality=100"
            className={styles.logo}
          />
          <h1>Project Lighthouse</h1>
          <p>Poly Haven's biggest adventure yet</p>
        </div>

        <div className={styles.sectionWrapper}>
          <div className={`${styles.section} ${styles.sectionFullWidth}`}>
            <div className={styles.subSection}>
              <div className={styles.steamIntro}>
                {steamIntro.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>

              <div className={styles.steamFeatures}>
                {steamFeatures.map((feature) => (
                  <div key={feature.title} className={styles.steamFeature}>
                    <h2>{feature.title}</h2>
                    <div className={styles.featureVideo}>
                      <video autoPlay loop muted playsInline>
                        <source src={feature.video} type="video/mp4" />
                      </video>
                    </div>
                    <p>{feature.text}</p>
                  </div>
                ))}
              </div>

              <WishlistCTA />
            </div>
          </div>
        </div>

        <div className={styles.sectionWrapper}>
          <div className={`${styles.section} ${styles.sectionHalfMobile}`}>
            <div className={styles.subSection}>
              <div className={styles.videoEmbed}>
                <iframe
                  src="https://www.youtube.com/embed/1sKLwMzcis0"
                  title="Project Lighthouse Announcement Trailer"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            <div className={styles.subSection}>
              <div className={styles.textLeft}>
                <p>
                  Poly Haven is developing its first-ever video game, <strong>Project Lighthouse</strong>, designed with
                  three goals in mind:
                </p>

                <ol>
                  <li>Create more free assets on polyhaven.com for game developers.</li>
                  <li>Demonstrate the value and potential of our work in a real production.</li>
                  <li>Explore the idea of selling games as a way to fund free assets for everyone.</li>
                </ol>
                <p>And we need your help to pull it off!</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.sectionWrapper} ${styles.joinWrapper}`}>
          <div className={styles.joinBackground} aria-hidden="true" ref={joinBgRef} />
          <div className={`${styles.section} ${styles.sectionFullWidth} ${styles.joinContent}`}>
            <div className={styles.subSection}>
              <div className={`${styles.text} ${styles.joinCard}`}>
                <h2>Join the Project</h2>
                <p>
                  We invite 3D artists of all skill levels to collaborate and work alongside us to create a library of
                  themed props that will be integrated directly into the game.
                </p>
                <p>
                  This is your chance to be a part of a greater project and leave your mark - help us shape the
                  environment of Project Lighthouse!
                </p>
                <p>
                  Your work will not only become part of our game, but will also be published on Poly Haven freely under
                  the <Link href="/license">CC0 license</Link>, building a lasting library of free content for everyone.
                </p>
                <Button text="Learn more" href="https://blog.polyhaven.com/project-lighthouse-challenge/" />
              </div>
            </div>
          </div>
        </div>

        {isBeforeDeadline && (
          <div className={styles.sectionWrapper}>
            <div className={`${styles.section} ${styles.sectionFullWidth}`}>
              <div className={styles.subSection}>
                <Countdown targetDate={submissionDeadline} maxInterval="weeks" />
                <div className={styles.row}>
                  <p style={{ textAlign: 'center' }}>
                    Until the submission deadline, rewards and sponsored prizes are available for all contributors to
                    help encourage quality contributions.
                  </p>
                  <p style={{ textAlign: 'center' }}>
                    After this, we'll still be busy with the game for some time, so you are welcome to continue to
                    contribute, but prizes will no longer be available.
                  </p>
                </div>
                <h3>$10,000+ of sponsored prizes available:</h3>
                <div className={styles.prizeList}>
                  {prizes?.map((prize) => (
                    <PrizeCard
                      key={prize.key}
                      link={prize.link}
                      title={prize.name}
                      image={`https://cdn.polyhaven.com/site_images/projects/lighthouse/prizes/${prize.key}.png?height=64&quality=95`}
                      description={prize.description}
                      copiesAvailable={prize.copies}
                      value={prize.value}
                      color={prize.color}
                    />
                  ))}
                  {!prizes.length && !errorPrizes && (
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <Spinner />
                    </div>
                  )}
                  {errorPrizes && (
                    <div style={{ color: 'red', textAlign: 'center', width: '100%' }}>
                      Error loading prizes: {errorPrizes.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.sectionWrapper}>
          <div className={`${styles.section} ${styles.sectionFullWidth}`}>
            <div className={styles.subSection}>
              <h2>Timeline</h2>
              <LighthouseTimeline />
              <p className={styles.warningText}>
                It's our first time making a game, this might not be completely accurate, please be gentle.
              </p>
              <Button text="Follow our dev logs" href="https://www.patreon.com/collection/1666420" />
            </div>
          </div>
        </div>

        <div className={styles.sectionWrapper}>
          <div className={`${styles.section} ${styles.sectionFullWidth}`}>
            <div className={styles.subSection}>
              <WishlistCTA />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Lighthouse
