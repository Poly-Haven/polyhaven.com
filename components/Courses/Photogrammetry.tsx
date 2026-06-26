import { MouseEvent, useState } from 'react'
import Link from 'next/link'
import { MdPlayArrow, MdExpandMore, MdCheck, MdRocketLaunch } from 'react-icons/md'
import { SiDiscord } from 'react-icons/si'

import { useUserPatron } from 'contexts/UserPatronContext'
import { formatDuration } from 'utils/formatDuration'
import Button from 'components/UI/Button/Button'
import BlenderMarket from 'components/UI/Icons/BlenderMarket'
import Lightbox from 'components/Lightbox/Lightbox'
import CourseCallToAction from './CourseCallToAction'
import CourseMilestone from './CourseMilestone'

import styles from './Photogrammetry.module.scss'

/* ---------------------------------------------------------------------------
 * Bespoke marketing / overview body for the Photogrammetry course.
 *
 * All art is PLACEHOLDER for now (local files under /public/course_promo, which
 * is gitignored). When the final art is uploaded to the CDN, repoint PROMO at
 * `https://cdn.polyhaven.com/site_images/courses/photogrammetry` and the whole
 * page swaps over. Lesson thumbnails (THUMB_CDN) are already live.
 * ------------------------------------------------------------------------- */

const PROMO = '/course_promo/photogrammetry'
const THUMB_CDN = 'https://cdn.polyhaven.com/site_images/courses/photogrammetry'
const DISCORD_URL = 'https://discord.gg/Dms7Mrs'

// Access gating mirrors api/videoUrl.ts — still the placeholder "Offline Access"
// reward until the dedicated $7 course tier exists. TODO: swap for the course reward.
const REQUIRED_REWARD = 'Offline Access'
// TODO: real checkout link for the new $7/mo course tier (rid unknown until it's created).
const PATREON_JOIN_URL = 'https://www.patreon.com/polyhaven'
// TODO: confirm the Superhive product URL once the listing is published.
const SUPERHIVE_URL = 'https://superhivemarket.com/products/poly-haven-photoscan-course'

// The course's 6 chapters, reframed as an outcome-led journey (the chapter list
// itself lives further down). Media is placeholder.
const STAGES = [
  {
    n: 1,
    kicker: 'Chapter 1 · Learn the fundamentals',
    title: 'Learn what makes a great scan',
    body: 'Understand what photoscanning really captures: real surface detail, not just colour. Learn why scanned materials look more believable than traditional textures or generated normals, and how photogrammetry fits into a modern 3D workflow.',
    media: { type: 'image', src: `${PROMO}/wall_scan.jpg` },
  },
  {
    n: 2,
    kicker: 'Chapter 2 · Scout and capture',
    title: 'Learn to see the world like a scanning artist',
    body: 'A good scan starts long before the shutter clicks. Learn the gear, camera settings, lighting techniques, then develop the instinct to recognise which surfaces to capture and which are better left behind.',
    media: { type: 'image', src: `${PROMO}/capture_drone.jpg` },
  },
  {
    n: 3,
    kicker: 'Chapter 3 · Create materials',
    title: 'Turn real surfaces into production-ready materials',
    body: 'Capture textures on location, develop the RAW files with accurate colour, then process them into seamless PBR materials complete with roughness, normal, displacement and ambient occlusion maps.',
    media: { type: 'video', src: `${PROMO}/chapter_03.mp4`, poster: `${PROMO}/wall_scan.jpg` },
  },
  {
    n: 4,
    kicker: 'Chapter 4 · Environment art',
    title: 'Build a believable environment',
    body: 'Bring your scans to life inside Blender. Create materials, add displacement, blend surfaces together, weather the environment, decorate, and light the scene until it feels like a real place instead of a collection of assets.',
    media: { type: 'image', src: `${PROMO}/render_05.jpg` },
  },
  {
    n: 5,
    kicker: 'Chapter 5 · Scan objects',
    title: 'Turn everyday objects into game-ready assets',
    body: 'Learn the complete object scanning workflow using rocks, planks, barrels and more. Process them through RealityScan, retopology, UV mapping, baking and cleanup to create production-ready models.',
    media: { type: 'video', src: `${PROMO}/chapter_05.mp4`, poster: `${PROMO}/render_06.jpg` },
  },
  {
    n: 6,
    kicker: 'Chapter 6 · Finish the scene',
    title: 'Bring everything together',
    body: 'Finish the environment using your own scans alongside the free Poly Haven library. Scatter vegetation, place props, add atmosphere and learn how individual assets become a convincing, finished scene.',
    media: { type: 'video', src: `${PROMO}/chapter_06.mp4`, poster: `${PROMO}/render_01.jpg` },
  },
]

const RENDERS = ['01', '02', '03', '04', '05', '06', '07', '08']

const StageMedia = ({ media }: { media: any }) => {
  if (media.type === 'video') {
    return (
      <video className={styles.stageVideo} controls muted loop playsInline preload="none" poster={media.poster}>
        <source src={media.src} type="video/mp4" />
      </video>
    )
  }
  return <img className={styles.stageImg} src={media.src} alt="" loading="lazy" />
}

const Photogrammetry = ({ course }) => {
  const { user, patron } = useUserPatron()

  const hasAccess = !!(patron?.rewards && patron.rewards.includes(REQUIRED_REWARD))

  const allLectures = (course?.chapters || []).flatMap((c) => c.lectures || [])
  const totalLessons = allLectures.length
  const totalSeconds = allLectures.reduce((s, l) => s + (l.duration || 0), 0)
  const totalHours = (totalSeconds / 3600).toFixed(1)
  const firstLecture = course?.chapters?.[0]?.lectures?.[0]?.slug
  const watchHref = firstLecture ? `/learn/${course.id}/${firstLecture}` : '#curriculum'

  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [openChapter, setOpenChapter] = useState<string | null>(course?.chapters?.[0]?.slug || null)

  const tilt = (e: MouseEvent<HTMLImageElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    e.currentTarget.style.setProperty('--tilt-x', `${(-y * 16).toFixed(2)}deg`)
    e.currentTarget.style.setProperty('--tilt-y', `${(x * 16).toFixed(2)}deg`)
  }
  const untilt = (e: MouseEvent<HTMLImageElement>) => {
    e.currentTarget.style.setProperty('--tilt-x', '0deg')
    e.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div className={styles.wrapper}>
      {/* ----------------------------- hero ----------------------------- */}
      <header className={styles.hero}>
        <img className={styles.heroBg} src={`${PROMO}/render_05.jpg`} alt="" />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <span className={styles.accentBar} />
          <p className={styles.kicker}>A Poly Haven Course</p>
          <h1>Turn the real world into production-ready 3D assets</h1>
          <p className={styles.heroSub}>Learn the production workflow behind Poly Haven's world-class scans.</p>
          <p className={styles.heroSub}>
            Join us on location in an abandoned factory and follow every step, from capture to a finished Blender
            environment.
          </p>
          <div className={styles.heroCtas}>
            {hasAccess ? (
              <Button text="Start watching" href={watchHref} color="accent" icon={<MdRocketLaunch />} />
            ) : (
              <Button text="Get the course" href="#pricing" color="accent" icon={<MdRocketLaunch />} />
            )}
            <Button text="Watch the trailer" href="#trailer" color="hollowFaded" icon={<MdPlayArrow />} />
          </div>
          <ul className={styles.heroStats}>
            <li>
              <strong>6</strong> chapters
            </li>
            <li>
              <strong>{totalLessons || 62}</strong> lessons
            </li>
            <li>
              <strong>{totalHours || 9}</strong> hours
            </li>
            <li>
              <strong>CC0</strong> project files
            </li>
          </ul>
        </div>
      </header>

      {hasAccess && (
        <div className={styles.accessBanner}>
          <MdCheck />
          <span>
            You have access to this course. <Link href={watchHref}>Jump back in &rarr;</Link>
          </span>
        </div>
      )}

      {/* ------------------------- trailer + reframe ------------------------- */}
      <div className={styles.trailerWrapper}>
        <section id="trailer" className={styles.split}>
          <div className={styles.trailerWrap}>
            <video className={styles.trailer} controls preload="none" poster={`${PROMO}/render_01.jpg`}>
              <source src={`${PROMO}/trailer.mp4`} type="video/mp4" />
            </video>
          </div>
          <div className={styles.splitText}>
            <span className={styles.accentBar} />
            <h2>Not just another intro photogrammetry tutorial</h2>
            <p>
              Most courses teach you a button: <em>"Here's how RealityScan works, here's how to photograph a rock."</em>{' '}
              This one teaches the <strong>decisions</strong>: which surfaces are worth capturing, which techniques to
              use and when.
            </p>
            <p>
              It's the full production pipeline we use to make the assets you already download from Poly Haven, start to
              finish, on one real project.
            </p>
            <p>
              By the end you won't just know the tools - you'll know exactly what to do when you arrive on location with
              a camera.
            </p>
          </div>
        </section>
      </div>

      {/* ----------------------------- journey ----------------------------- */}
      <section className={styles.journey}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>From an empty lot to a finished scene</h2>
          <p>One continuous project in six stages. Learn a repeatable system, not a bag of tricks.</p>
        </div>

        {STAGES.map((stage) => (
          <div key={stage.n} className={styles.stage}>
            <div className={styles.stageMedia}>
              <StageMedia media={stage.media} />
            </div>
            <div className={styles.stageText}>
              <span className={styles.stageNum}>Stage {stage.n}</span>
              <span className={styles.stageKicker}>{stage.kicker}</span>
              <h3>{stage.title}</h3>
              <p>{stage.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ----------------------------- proof ----------------------------- */}
      <section className={styles.proof}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>
            A workflow refined over <Link href="/all">hundreds</Link> of scans
          </h2>
          <p>
            From tileable materials to complex 3D models, every project follows the same production pipeline.
            <br />
            Learn the repeatable workflow behind the assets published on Poly Haven, then apply it to your own work.
          </p>
        </div>

        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {[...allLectures, ...allLectures].map((l, i) => (
              <img
                key={`${l.slug}-${i}`}
                src={`${THUMB_CDN}/${l.slug}.jpg?width=220&quality=90`}
                alt=""
                loading="lazy"
              />
            ))}
          </div>
        </div>

        <div className={styles.renderGrid}>
          {RENDERS.map((n) => (
            <img
              key={n}
              className={styles.renderThumb}
              src={`${PROMO}/render_${n}.jpg`}
              alt="Final render from the course"
              loading="lazy"
              onMouseMove={tilt}
              onMouseLeave={untilt}
              onClick={() => setLightboxImage(`${PROMO}/render_${n}.jpg`)}
            />
          ))}
        </div>
      </section>

      {/* --------------------------- what's included --------------------------- */}
      <section className={styles.included}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>More than just video lessons</h2>
        </div>

        <div className={styles.includedGrid}>
          <div className={styles.includedCard}>
            <strong>A complete project</strong>
            <p>
              Build a fully dressed Blender environment using your own scans alongside free assets from the Poly Haven
              library.
            </p>
          </div>
          <div className={styles.includedCard}>
            <strong>
              {totalLessons || 62} lessons · {totalHours || 9} hours
            </strong>
            <p>
              Six structured chapters covering the complete production workflow, with English captions on every lesson.
            </p>
          </div>

          <div className={styles.includedCard}>
            <strong>Every project file</strong>
            <p>
              Download the RAW photos, Blender scenes, finished textures and scanned models used throughout the course.
            </p>
          </div>

          <div className={styles.includedCard}>
            <strong>Learn together</strong>
            <p>
              Join our{' '}
              <a href="https://discord.gg/Dms7Mrs" target="_blank" rel="noopener noreferrer">
                Discord
              </a>{' '}
              community to ask questions, share your work and get feedback from the Poly Haven team and other artists.
            </p>
          </div>
        </div>
        <div className={styles.softwareRow}>
          <span>
            <em>Software used:</em>
          </span>
          <span>
            <a href="https://www.blender.org/" target="_blank" rel="noopener noreferrer">
              Blender
            </a>
          </span>
          <span>
            <a href="https://www.unrealengine.com/en-US/realityscan" target="_blank" rel="noopener noreferrer">
              RealityScan
            </a>
          </span>
          <span>
            <a href="https://www.adobe.com/products/photoshop.html" target="_blank" rel="noopener noreferrer">
              Photoshop
            </a>
          </span>
          <span>
            <a href="https://rawtherapee.com/" target="_blank" rel="noopener noreferrer">
              RawTherapee
            </a>
          </span>
          <span>
            <a
              href="https://www.adobe.com/products/substance3d/apps/painter.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Substance 3D Painter
            </a>
          </span>
          <span>
            <a href="https://github.com/wjakob/instant-meshes" target="_blank" rel="noopener noreferrer">
              Instant Meshes
            </a>
          </span>
          <span>
            <a href="https://xnormal.net/" target="_blank" rel="noopener noreferrer">
              xNormal
            </a>
          </span>
        </div>
      </section>

      {/* ----------------------------- pricing ----------------------------- */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>Choose your path...</h2>
          <p>
            Every asset on Poly Haven is free and always will be. This course is one of the ways we fund that - choose
            the path that fits you.
          </p>
        </div>

        <CourseCallToAction
          hasAccess={hasAccess}
          watchHref={watchHref}
          signInHref={`/account?returnTo=/learn/photogrammetry#pricing`}
          patreonUrl={PATREON_JOIN_URL}
          patreonPrice="$7"
          patreonFeatures={[
            'The full course, streamed online',
            'Early access to Poly Haven assets',
            'Vaults & our Blender add-on',
            'Cancel anytime',
          ]}
          secondaryUrl={SUPERHIVE_URL}
          secondaryIcon={<BlenderMarket />}
          secondaryTitle="Superhive"
          secondaryPrice="$39"
          secondaryFeatures={[
            'The full course, yours forever',
            'Downloadable for offline viewing',
            'All project files included',
            'Free updates',
          ]}
        />

        <div className={styles.priceNotes}>
          <p>
            Both options are identical and support the ongoing development of <Link href="/all">free assets</Link> for
            everyone.
          </p>
          <p>
            Choose <strong>Patreon</strong> to gain{' '}
            <abbr title="All lower Patreon benefits are included, e.g. our Blender add-on, early access, Vaulted content, etc.">
              additional benefits
            </abbr>{' '}
            and help unlock the course for everyone for free (see below).
          </p>
          <p>
            Choose <strong>Superhive</strong> if you just want the course.
          </p>
        </div>
        <CourseMilestone patreonUrl={PATREON_JOIN_URL} />
      </section>

      {/* ----------------------------- curriculum ----------------------------- */}
      <section id="curriculum" className={styles.curriculum}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>The full curriculum</h2>
        </div>
        <div className={styles.chapterList}>
          {(course?.chapters || []).map((chapter) => {
            const isOpen = openChapter === chapter.slug
            const lectures = chapter.lectures || []
            return (
              <div key={chapter.slug} className={styles.chapterBlock}>
                <button className={styles.chapterToggle} onClick={() => setOpenChapter(isOpen ? null : chapter.slug)}>
                  <span className={styles.chapterIndex}>{chapter.slug}</span>
                  <span className={styles.chapterName}>{chapter.name}</span>
                  <span className={styles.chapterCount}>{lectures.length} lessons</span>
                  <MdExpandMore className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
                </button>
                {isOpen && (
                  <ul className={styles.lectureList}>
                    {lectures.map((l) => (
                      <li key={l.slug}>
                        <span className={styles.lectureName}>{l.name}</span>
                        {l.duration ? <span className={styles.lectureDur}>{formatDuration(l.duration)}</span> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ----------------------------- brand ----------------------------- */}
      <section className={styles.brand}>
        <div className={styles.brandInner}>
          <span className={styles.accentBar} />
          <h2>Made by humans at Poly Haven</h2>

          <p>
            For over 10 years, we've been capturing and publishing free HDRIs, textures, and 3D models used by millions
            of artists around the world.
          </p>
          <p>
            This course teaches the same production workflow we use ourselves - built on real photography, practical
            experience and years of refinements, not generative AI.
          </p>
          <p>
            Every purchase helps fund more free assets for everyone. As always, you can read our public{' '}
            <Link href="/finance-reports">finance reports</Link> to see where your money goes.
          </p>

          <p className={styles.help}>
            <SiDiscord /> Questions before you start?{' '}
            <a href={DISCORD_URL} target="_blank" rel="noreferrer">
              Ask us on Discord
            </a>
          </p>
        </div>
      </section>

      {/* ----------------------------- final CTA ----------------------------- */}
      <section className={styles.finalCta}>
        <img className={styles.finalBg} src={`${PROMO}/render_01.jpg`} alt="" />
        <div className={styles.finalOverlay} />
        <div className={styles.finalInner}>
          <h2>Start scanning the real world</h2>
          {hasAccess ? (
            <Button
              text="Start watching"
              href={watchHref}
              color="accent"
              icon={<MdRocketLaunch />}
              style={{ fontSize: '1.1rem', padding: '0.9em 2.2em' }}
            />
          ) : (
            <Button
              text="Get the course"
              href="#pricing"
              color="accent"
              icon={<MdRocketLaunch />}
              style={{ fontSize: '1.1rem', padding: '0.9em 2.2em' }}
            />
          )}
        </div>
      </section>

      <Lightbox
        isOpen={!!lightboxImage}
        imageSrc={lightboxImage || ''}
        imageAlt="Final render from the Photogrammetry course"
        onClose={() => setLightboxImage(null)}
        caption="From the finished course scene"
      />
    </div>
  )
}

export default Photogrammetry
