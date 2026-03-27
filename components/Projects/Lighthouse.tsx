import { MouseEvent, useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import apiSWR from 'utils/apiSWR'
import useDivSize from 'hooks/useDivSize'

import Button from 'components/UI/Button/Button'
import Countdown from 'components/UI/Countdown/Countdown'
import Lightbox from 'components/Lightbox/Lightbox'
import Spinner from 'components/UI/Spinner/Spinner'
import PrizeCard from './PrizeCard'

import styles from './Lighthouse.module.scss'

const AssetCard = ({
  slug,
  onMouseMove,
  onMouseLeave,
}: {
  slug: string
  onMouseMove: (e: MouseEvent<HTMLImageElement>) => void
  onMouseLeave: (e: MouseEvent<HTMLImageElement>) => void
}) => (
  <a className={styles.assetCard} href={`https://polyhaven.com/a/${slug}`} target="_blank" rel="noopener noreferrer">
    <img
      src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=200&height=200&quality=95`}
      alt={slug}
      className={styles.clickableImage}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    />
  </a>
)

const Lighthouse = () => {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const submissionDeadline = '2026-05-01T23:59:59.999Z'
  const currentTime = new Date().toISOString()
  const isBeforeDeadline = currentTime < submissionDeadline

  const updateImageTilt = (e: MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width - 0.5
    const relativeY = (e.clientY - rect.top) / rect.height - 0.5
    const maxTilt = 7

    e.currentTarget.style.setProperty('--tilt-x', `${(-relativeY * maxTilt * 3).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--tilt-y', `${(relativeX * maxTilt * 3).toFixed(2)}deg`)
  }

  const resetImageTilt = (e: MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.setProperty('--tilt-x', '0deg')
    e.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  const gameplayConceptImages = [
    'https://cdn.polyhaven.com/site_images/projects/lighthouse/gp1.png',
    'https://cdn.polyhaven.com/site_images/projects/lighthouse/gp4.png',
    'https://cdn.polyhaven.com/site_images/projects/lighthouse/gp3.png',
    'https://cdn.polyhaven.com/site_images/projects/lighthouse/gp2.png',
  ]

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

  const { data: assets, error: errorAssets } = apiSWR(`/assets?t=all&future=true&c=collection: project_lighthouse`, {
    revalidateOnFocus: false,
  })
  const assetGalleryRef = useRef(null)
  const { height: assetGalleryHeight } = useDivSize(assetGalleryRef, [assets])

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
          <div className={styles.section}>
            <div className={styles.subSection}>
              <iframe
                width={650}
                height={650 * (9 / 16)}
                src="https://www.youtube.com/embed/1sKLwMzcis0"
                title="Project Lighthouse Announcement Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.subSection}>
              <div className={styles.text} style={{ textAlign: 'left' }}>
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

        <div className={styles.sectionWrapper}>
          <div className={styles.section} style={{ maxWidth: '100%' }}>
            <div className={styles.subSection}>
              <div className={styles.imgGrid}>
                {gameplayConceptImages.map((imageUrl) => (
                  <img
                    key={imageUrl}
                    className={styles.clickableImage}
                    src={`${imageUrl}?width=284&quality=95`}
                    alt="Project Lighthouse concept art"
                    onMouseMove={updateImageTilt}
                    onMouseLeave={resetImageTilt}
                    onClick={() => setLightboxImage(`${imageUrl}?width=1600&quality=95`)}
                  />
                ))}
              </div>
            </div>
            <div className={styles.subSection}>
              <div className={styles.text}>
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
            <div className={styles.subSection}>
              {assets && (
                <div className={styles.assetGallery}>
                  <div
                    className={styles.assetGalleryInner}
                    style={
                      (assetGalleryHeight
                        ? {
                            '--scroll-height': `-${assetGalleryHeight}px`,
                            '--scroll-duration': `${(assetGalleryHeight / 50).toFixed(2)}s`,
                          }
                        : { animationPlayState: 'paused' }) as React.CSSProperties
                    }
                  >
                    <div ref={assetGalleryRef} className={styles.assetGalleryPage}>
                      {Object.keys(assets).map((slug) => (
                        <AssetCard key={slug} slug={slug} onMouseMove={updateImageTilt} onMouseLeave={resetImageTilt} />
                      ))}
                    </div>
                    <div className={styles.assetGalleryPage} aria-hidden="true">
                      {Object.keys(assets).map((slug) => (
                        <AssetCard
                          key={`${slug}-dup`}
                          slug={slug}
                          onMouseMove={updateImageTilt}
                          onMouseLeave={resetImageTilt}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {errorAssets && (
                <div style={{ color: 'red', textAlign: 'center', width: '100%' }}>
                  Error loading assets: {errorAssets.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {isBeforeDeadline && (
          <div className={styles.sectionWrapper}>
            <div className={styles.section} style={{ maxWidth: '100%' }}>
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
                      image={prize.thumbnail}
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
          <div className={styles.section} style={{ maxWidth: '100%' }}>
            <div className={styles.subSection}>
              <h2>About the Game</h2>
              <p>
                Explore an atmospheric lighthouse island, solve puzzles with otherworldly technology, and uncover why
                it's not so easy for you to leave.
              </p>
              <div className={styles.gameplayVideos}>
                <video autoPlay loop muted playsInline controls={true}>
                  <source src="https://u.polyhaven.org/SFI/Alpha_Gameplay_short_01_web.mp4" type="video/mp4" />
                </video>
                <video autoPlay loop muted playsInline controls={true}>
                  <source src="https://u.polyhaven.org/Mie/Alpha_Gameplay_short_02_web.mp4" type="video/mp4" />
                </video>
                <video autoPlay loop muted playsInline controls={true}>
                  <source src="https://u.polyhaven.org/K6j/Alpha_Gameplay_short_03_web.mp4" type="video/mp4" />
                </video>
              </div>
              <hr />
              <div className={styles.row}>
                <p>
                  Project Lighthouse is a first-person linear atmospheric puzzle game that plunges you onto a remote,
                  craggy island with a simple mission: Restore functionality to a vital Lighthouse as urgently as
                  possible. But...
                </p>
                <p>
                  Your plans unexpectedly change the moment you activate the lighthouse mechanism. Encased in a
                  shimmering energy dome, the island is violently transformed and the lighthouse becomes the epicentre
                  of a mysterious scientific catastrophe.
                </p>
                <p>
                  Using highly experimental technology, you explore and solve environmental puzzles to uncover the fate
                  of the island's disappeared inhabitants, solve the mysteries of a catastrophic experiment, and escape
                  from being trapped in a philosophical limbo.
                </p>
              </div>
              <Button text="Learn more" href="https://blog.polyhaven.com/project-lighthouse-challenge/" />
            </div>
          </div>
        </div>

        <Lightbox
          isOpen={!!lightboxImage}
          imageSrc={lightboxImage || ''}
          imageAlt="Project Lighthouse concept art"
          onClose={() => setLightboxImage(null)}
          caption="Early visual concepts, WIP"
        />
      </div>
    </>
  )
}

export default Lighthouse
