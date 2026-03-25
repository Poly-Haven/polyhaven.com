import Button from 'components/UI/Button/Button'

import styles from './Lighthouse.module.scss'

const Lighthouse = () => {
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
              <div className={styles.imgGrid}>
                <img src="https://loremflickr.com/284/160" />
                <img src="https://loremflickr.com/284/160" />
                <img src="https://loremflickr.com/284/160" />
                <img src="https://loremflickr.com/284/160" />
              </div>
            </div>
            <div className={styles.subSection}>
              <div className={styles.text} style={{ textAlign: 'left' }}>
                <p>
                  Poly Haven is developing its first-ever video game, <strong>Project Lighthouse</strong>, designed with
                  three goals in mind:
                </p>

                <ol>
                  <li>Improve the quality and usability of free assets on polyhaven.com for game developers.</li>
                  <li>Demonstrate the value and potential of our work in a real production.</li>
                  <li>Explore the idea of selling games as a way to fund our work creating free assets.</li>
                </ol>
                <p>And we need your help to pull it off!</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionWrapper}>
          <div className={styles.section} style={{ maxWidth: '100%' }}>
            <div className={styles.subSection} style={{ flexBasis: 'auto' }}>
              <div className={styles.text}>
                <h2>Join the Project</h2>
                <p>
                  We are inviting 3D artists of all skill levels to collaborate and work alongside us to create a
                  library of themed props that will be integrated directly into the game.
                </p>
                <p>
                  This is your chance to be a part of a greater project and leave your mark - help us shape the
                  environment of Project Lighthouse!
                </p>
                <p>
                  Your work will not only become part of our game, but will also be published on Poly Haven freely under
                  the CC0 license, building a lasting library of free content for everyone.
                </p>
                <Button text="Learn more" href="https://blog.polyhaven.com/project-lighthouse-challenge/" />
              </div>
            </div>
            <div className={styles.subSection} style={{ flexBasis: 'auto' }}>
              <div className={styles.imgGrid}>
                <img src="https://loremflickr.com/250/398" />
                <img src="https://loremflickr.com/250/398" />
                <img src="https://loremflickr.com/250/398" />
                <img src="https://loremflickr.com/250/398" />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sectionWrapper}>
          <div className={styles.section}>
            <div className={styles.subSection}>
              <em>- countdown -</em>
              <div className={styles.row}>
                <p style={{ textAlign: 'center' }}>
                  Until the submission deadline, rewards and sponsored prizes are available for all contributors to help
                  encourage quality contributions.
                </p>
                <p style={{ textAlign: 'center' }}>
                  After this, we'll still be busy with the game for some time, so you are welcome to continue to
                  contribute, but prizes will no longer be available.
                </p>
              </div>
              <em>- prize list -</em>
            </div>
          </div>
        </div>

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
                  <source src="https://u.polyhaven.org/iGp/Alpha_Gameplay_short_01_web.mp4" type="video/mp4" />
                </video>
                <video autoPlay loop muted playsInline controls={true}>
                  <source src="https://u.polyhaven.org/9vv/Alpha_Gameplay_short_02_web.mp4" type="video/mp4" />
                </video>
                <video autoPlay loop muted playsInline controls={true}>
                  <source src="https://u.polyhaven.org/zlP/Alpha_Gameplay_short_03_web.mp4" type="video/mp4" />
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
      </div>
    </>
  )
}

export default Lighthouse
