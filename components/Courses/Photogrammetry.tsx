import { MouseEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { MdPlayArrow, MdExpandMore, MdCheck, MdRocketLaunch } from 'react-icons/md'
import { SiDiscord } from 'react-icons/si'

import { useUserPatron } from 'contexts/UserPatronContext'
import { formatDuration, formatDurationCoarse } from 'utils/formatDuration'
import Button from 'components/UI/Button/Button'
import BlenderMarket from 'components/UI/Icons/BlenderMarket'
import Lightbox from 'components/Lightbox/Lightbox'
import CourseCallToAction from './CourseCallToAction'
import CourseMilestone from './CourseMilestone'

import styles from './Photogrammetry.module.scss'

/* ---------------------------------------------------------------------------
 * Bespoke marketing / overview body for the Photogrammetry course.
 * ------------------------------------------------------------------------- */

const PROMO = 'https://cdn.polyhaven.com/site_images/courses/photogrammetry/promo'
const THUMB_CDN = 'https://cdn.polyhaven.com/site_images/courses/photogrammetry/chapter_thumbs'
const DISCORD_URL = 'https://discord.gg/Dms7Mrs'

// Access gating mirrors api/videoUrl.ts — still the placeholder "Offline Access"
// reward until the dedicated $7 course tier exists. TODO: swap for the course reward.
const REQUIRED_REWARD = 'Offline Access'
// TODO: real checkout link for the new $7/mo course tier (rid unknown until it's created).
const PATREON_JOIN_URL = 'https://www.patreon.com/polyhaven'
const SUPERHIVE_URL = 'https://superhivemarket.com/products/polyhaven-production-photogrammetry?ref=3841'

// The whole pipeline in three beats, paired with the trailer's differentiation pitch.
// Plenty of our visitors are here for free HDRIs and have never scanned anything, so
// this is the "what does that actually involve" rung above the 6 chapters / 62 lessons.
const BEATS = [
  {
    n: '01',
    title: 'Capture',
    body: 'Find and photograph the right surfaces and objects on location.',
  },
  {
    n: '02',
    title: 'Process',
    body: 'Turn raw photos into clean tileable materials and game-ready models.',
  },
  {
    n: '03',
    title: 'Build',
    body: 'Assemble, light and dress a finished environment around your own scans.',
  },
]

// One source of truth for tool links, used by both the per-stage chips and the full
// list in "what's included" — "do I have to buy anything to follow along?" is the most
// common question a course like this has to answer, so every mention is clickable.
// Insertion order drives the softwareRow.
const SOFTWARE_URLS: Record<string, string> = {
  Blender: 'https://www.blender.org/',
  RealityScan: 'https://www.realityscan.com/',
  Photoshop: 'https://www.adobe.com/products/photoshop.html',
  RawTherapee: 'https://rawtherapee.com/',
  'Substance 3D Painter': 'https://www.adobe.com/products/substance3d/apps/painter.html',
  'Instant Meshes': 'https://github.com/wjakob/instant-meshes',
  xNormal: 'https://xnormal.net/',
}

type Stage = {
  n: number
  kicker: string
  title: string
  body: string
  media: { type: string; src: string; poster?: string }
  software?: (keyof typeof SOFTWARE_URLS)[]
  techniques?: string
}

// The course's 6 chapters, reframed as an outcome-led journey (the chapter list
// itself lives further down). Media is placeholder.
//
// `software`/`techniques` mirror the per-chapter spec boxes on the Superhive listing:
// "which tools do I actually need, and where?" is the most common question a course
// like this has to answer. Both are derived from the lecture descriptions in the API
// — keep them in sync if the curriculum changes. The linked, complete tool list still
// lives in the softwareRow further down; these are deliberately plain text.
const STAGES: Stage[] = [
  {
    n: 1,
    kicker: 'The fundamentals',
    title: 'Learn what makes a great scan',
    body: 'Understand what photoscanning really captures: real surface detail, not just colour. Learn why scanned materials look more believable than traditional textures or generated normals, and how photogrammetry fits into a modern 3D workflow.',
    media: { type: 'image', src: `${PROMO}/render_07.jpg?width=576` },
  },
  {
    n: 2,
    kicker: 'Scout and capture',
    title: 'Learn to see the world like a scanning artist',
    body: 'A good scan starts long before the shutter clicks. Learn the gear, camera settings, lighting techniques, then develop the instinct to recognise which surfaces to capture and which are better left behind.',
    media: { type: 'image', src: `${PROMO}/03_01_.jpg?width=576&flop=true` },
    techniques:
      'Camera settings, flash lighting, light and weather, colour charts, drone scanning, judging scannable surfaces',
  },
  {
    n: 3,
    kicker: 'Create materials',
    title: 'Turn real surfaces into production-ready materials',
    body: 'Capture textures on location, develop the RAW files with accurate colour, then process them into seamless PBR materials complete with roughness, normal, displacement and ambient occlusion maps.',
    media: {
      type: 'video',
      src: `https://u.polyhaven.org/9iq/Chapter_03_Short_web.mp4`,
      poster: `${PROMO}/wall_scan.jpg?width=576`,
    },
    software: ['RawTherapee', 'RealityScan', 'Blender', 'xNormal', 'Photoshop'],
    techniques:
      'RAW development and colour calibration, photoscan reconstruction, bake planes and AO baking, seamless tiling, roughness maps',
  },
  {
    n: 4,
    kicker: 'Environment art',
    title: 'Build a believable environment',
    body: 'Bring your scans to life inside Blender. Create materials, add displacement, blend surfaces together, weather the environment, decorate, and light the scene until it feels like a real place instead of a collection of assets.',
    media: { type: 'image', src: `${PROMO}/render_05.jpg?width=576` },
    software: ['Blender'],
    techniques:
      'Scene blockout, Cycles material setup, adaptive displacement, vertex-paint blending, weathering, HDRI lighting and atmosphere',
  },
  {
    n: 5,
    kicker: 'Scan objects',
    title: 'Turn everyday objects into game-ready assets',
    body: 'Learn the complete object scanning workflow using rocks, planks, barrels and more. Process them through RealityScan, retopology, UV mapping, baking and cleanup to create production-ready models.',
    media: {
      type: 'video',
      src: `https://u.polyhaven.org/5L1/Chapter_05_Short_web.mp4`,
      poster: `${PROMO}/05_05.jpg?width=576`,
    },
    software: [
      'RawTherapee',
      'RealityScan',
      'Blender',
      'Instant Meshes',
      'xNormal',
      'Substance 3D Painter',
      'Photoshop',
    ],
    techniques:
      'Field capture, scan reconstruction, mesh cleanup, retopology, UV mapping, texture reprojection, texture repair, opacity masking',
  },
  {
    n: 6,
    kicker: 'Finish the scene',
    title: 'Bring everything together',
    body: 'Finish the environment using your own scans alongside the free Poly Haven library. Scatter vegetation, place props, add atmosphere and learn how individual assets become a convincing, finished scene.',
    media: {
      type: 'video',
      src: `https://u.polyhaven.org/IiA/Chapter_06_Short_web.mp4`,
      poster: `${PROMO}/render_06.jpg?width=576`,
    },
    software: ['Blender'],
    techniques:
      'Appending Poly Haven assets, vertex-paint masks, scatter modifier, hand-placement, camera depth of field, puddle masks',
  },
]

// Skimmable answer to "does it cover X?" — the journey reads as narrative and the
// curriculum lists lesson names, so neither answers that without being read in full.
const SKILLS = [
  'Capture texture scans on location',
  'Scan objects into game-ready models',
  'Develop RAW files with accurate colour',
  'Build seamless tileable PBR materials',
  'Reconstruct scans in RealityScan',
  'Retopology and UV mapping',
  'Bake and repair scan textures',
  'Build, light and dress a full environment',
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

const CTA_BUTTON_STYLE = { fontSize: '1.1rem', padding: '0.9em 2.2em' }

// Used twice: once under the skills list and once to close the page. Shared so the
// copy and button can't drift apart; the surrounding wrapper sets the heading size.
const CtaBlock = ({ hasAccess, watchHref }: { hasAccess: boolean; watchHref: string }) => (
  <>
    <h2>Start scanning the real world</h2>
    {hasAccess ? (
      <Button
        text="Start watching"
        href={watchHref}
        color="accent"
        icon={<MdRocketLaunch />}
        style={CTA_BUTTON_STYLE}
      />
    ) : (
      <Button text="Get the course" href="#pricing" color="accent" icon={<MdRocketLaunch />} style={CTA_BUTTON_STYLE} />
    )}
  </>
)

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

  // Smooth-scroll the in-page #anchor links (hero -> #trailer/#pricing, CTAs -> #pricing).
  // It goes on <html> because that's the scrolling element, and Next's hash navigation
  // calls scrollIntoView() with no args, which defers to this. Reverted on unmount so it
  // doesn't leak to the rest of the site, and skipped entirely for reduced-motion users.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'
    return () => {
      root.style.scrollBehavior = previous
    }
  }, [])

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
              <strong>{totalHours || 8}</strong> hours
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

      {/* ----------------------------- trailer ----------------------------- */}
      <section id="trailer" className={styles.trailerWrapper}>
        <video className={styles.trailer} controls preload="none" poster={`${PROMO}/render_01.jpg`}>
          <source src="https://u.polyhaven.org/gCG/photoscan_Course_Intro_Trailer_V2_web.mp4" type="video/mp4" />
        </video>
      </section>

      {/* ------------------------- primer + reframe ------------------------- */}
      <section className={styles.splitWrapper}>
        <section className={styles.split}>
          <div className={styles.beats}>
            {BEATS.map((beat) => (
              <div key={beat.n} className={styles.beat}>
                <span className={styles.beatNum}>{beat.n}</span>
                <div className={styles.beatText}>
                  <strong>{beat.title}</strong>
                  <p>{beat.body}</p>
                </div>
              </div>
            ))}
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
      </section>

      {/* ----------------------------- journey ----------------------------- */}
      <section className={styles.journey}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>From an empty lot to a finished scene</h2>
          <p>One continuous project in six stages. Learn a repeatable system, not a bag of tricks.</p>
        </div>

        {STAGES.map((stage) => (
          <div key={stage.n} className={styles.stageWrapper}>
            <div className={styles.stage}>
              <div className={styles.stageMedia}>
                <StageMedia media={stage.media} />
              </div>
              <div className={styles.stageText}>
                <span className={styles.stageNum}>Chapter {stage.n}</span>
                <span className={styles.stageKicker}>{stage.kicker}</span>
                <h3>{stage.title}</h3>
                <p>{stage.body}</p>
                {(stage.software || stage.techniques) && (
                  <div className={styles.stageSpecs}>
                    {stage.software && (
                      <div className={styles.stageSpecRow}>
                        <span className={styles.stageSpecLabel}>Software used</span>
                        <div className={styles.stageSoftware}>
                          {stage.software.map((tool) => (
                            <a
                              key={tool}
                              className={styles.softwareChip}
                              href={SOFTWARE_URLS[tool]}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {tool}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    {stage.techniques && (
                      <div className={styles.stageSpecRow}>
                        <span className={styles.stageSpecLabel}>Techniques covered</span>
                        <p className={styles.stageTechniques}>{stage.techniques}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ----------------------------- skills ----------------------------- */}
      <section className={styles.skills}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>What you'll walk away able to do</h2>
        </div>
        <ul className={styles.skillsGrid}>
          {SKILLS.map((skill) => (
            <li key={skill} className={styles.skillItem}>
              <MdCheck />
              {skill}
            </li>
          ))}
        </ul>

        <div className={styles.inlineCta}>
          <CtaBlock hasAccess={hasAccess} watchHref={watchHref} />
        </div>
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
              src={`${PROMO}/render_${n}.jpg?width=291`}
              alt="Final render from the course"
              loading="lazy"
              onMouseMove={tilt}
              onMouseLeave={untilt}
              onClick={() => setLightboxImage(`${PROMO}/render_${n}.jpg?width=1600`)}
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
              {totalLessons || 62} lessons · {totalHours || 8} hours
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
          {Object.entries(SOFTWARE_URLS).map(([tool, url]) => (
            <span key={tool}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                {tool}
              </a>
            </span>
          ))}
        </div>
      </section>

      {/* ----------------------------- pricing ----------------------------- */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionHead}>
          <span className={styles.accentBar} />
          <h2>Choose your path...</h2>
          <p>
            At Poly Haven we make{' '}
            <Link href="/all" target="_blank">
              free high quality 3D assets
            </Link>{' '}
            for everyone. This course is one of the ways we fund that.
          </p>
        </div>

        <CourseCallToAction
          hasAccess={hasAccess}
          watchHref={watchHref}
          signInHref={`/account?returnTo=/learn/photogrammetry/01_00`}
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
            const chapterSeconds = lectures.reduce((s, l) => s + (l.duration || 0), 0)
            return (
              <div key={chapter.slug} className={styles.chapterBlock}>
                <button className={styles.chapterToggle} onClick={() => setOpenChapter(isOpen ? null : chapter.slug)}>
                  <span className={styles.chapterIndex}>{chapter.slug}</span>
                  <span className={styles.chapterName}>{chapter.name}</span>
                  <span className={styles.chapterCount}>
                    {lectures.length} lessons
                    {chapterSeconds > 0 && ` · ${formatDurationCoarse(chapterSeconds)}`}
                  </span>
                  <MdExpandMore className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
                </button>
                {isOpen && (
                  <ul className={styles.lectureList}>
                    {lectures.map((l) => (
                      <li key={l.slug}>
                        <Link href={`/learn/photogrammetry/${l.slug}`} className={styles.lectureLink}>
                          <span className={styles.lectureName}>{l.name}</span>
                          {l.duration ? <span className={styles.lectureDur}>{formatDuration(l.duration)}</span> : null}
                        </Link>
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
          <CtaBlock hasAccess={hasAccess} watchHref={watchHref} />
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
