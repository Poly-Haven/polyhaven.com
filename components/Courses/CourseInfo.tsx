import Link from 'next/link'
import { MdInfoOutline, MdDownload, MdArrowOutward } from 'react-icons/md'
import { FaDiscord } from 'react-icons/fa'

import { useUserPatron } from 'contexts/UserPatronContext'
import styles from './CourseInfo.module.scss'

const DISCORD_URL = 'https://discord.gg/Dms7Mrs'

// Supplementary downloads, per course. Only rendered for signed-in viewers.
const SUPPLEMENTARY = {
  photogrammetry: {
    scene: {
      name: 'Final scene file',
      note: 'The complete, packed Blender scene from the course.',
      url: 'https://u.polyhaven.org/courses/photogrammetry/Factory_scene_Final_Packed.zip/Factory_scene_Final_Packed.zip',
    },
    scans: [
      'Barrel_wheel',
      'Brick_Wall_red',
      'Concrete_Plates',
      'Grey_Roof',
      'Herringbone_Tiles',
      'Hexagon_Tiles',
      'Rock_Stones',
      'Wooden_Planks',
      'Yellow_Bricks',
    ].map((slug) => ({
      name: slug.replace(/_/g, ' '),
      url: `https://u.polyhaven.org/courses/photogrammetry/scans/${slug}.zip`,
    })),
  },
}

// Other benefits included with the course-tier Patreon pledge.
const PATRON_BENEFITS = [
  {
    title: 'Early access',
    desc: 'Get new HDRIs, textures and models before everyone else.',
    href: 'https://www.patreon.com/posts/14640360?collection=328908',
    external: true,
  },
  {
    title: 'Vaults',
    desc: 'Unlock bonus asset collections funded by patrons.',
    href: '/vaults',
    external: false,
  },
  {
    title: 'Offline access',
    desc: 'Download the entire library in bulk for offline use.',
    href: 'https://www.patreon.com/posts/14640286?collection=328908',
    external: true,
  },
  {
    title: 'Blender add-on',
    desc: 'Browse and import the whole library from inside Blender.',
    href: 'https://www.patreon.com/posts/70974704?collection=328908',
    external: true,
  },
]

const CourseInfo = ({ course }) => {
  const { user } = useUserPatron()

  // Never expose course files or benefit links to logged-out visitors.
  if (!user) return null

  const supp = SUPPLEMENTARY[course.id]

  return (
    <section className={styles.info}>
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Course</span>
          <h2 className={styles.title}>{course.name}</h2>
        </div>
        <div className={styles.headLinks}>
          <Link href={`/learn/${course.id}`} className={styles.aboutBtn}>
            <MdInfoOutline />
            About the course
          </Link>
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={styles.discordBtn}>
            <FaDiscord />
            Get support on Discord
          </a>
        </div>
      </div>

      <div className={styles.block}>
        <h3 className={styles.blockTitle}>Your other Patreon benefits</h3>
        <p>Your Patreon membership includes more than just this course.</p>
        <p>
          When you've finished watching, consider{' '}
          <a href="https://www.patreon.com/settings/memberships/polyhaven" target="_blank">
            downgrading to a lower tier
          </a>{' '}
          to keep these benefits and continue supporting us.
        </p>

        <div className={styles.benefitGrid}>
          {PATRON_BENEFITS.map((b) =>
            b.external ? (
              <a key={b.title} href={b.href} target="_blank" rel="noreferrer" className={styles.benefitCard}>
                <span className={styles.benefitHead}>
                  {b.title}
                  <MdArrowOutward />
                </span>
                <span className={styles.benefitDesc}>{b.desc}</span>
              </a>
            ) : (
              <Link key={b.title} href={b.href} className={styles.benefitCard}>
                <span className={styles.benefitHead}>
                  {b.title}
                  <MdArrowOutward />
                </span>
                <span className={styles.benefitDesc}>{b.desc}</span>
              </Link>
            )
          )}
        </div>
      </div>

      {supp && (
        <div className={styles.block}>
          <h3 className={styles.blockTitle}>Course files</h3>
          <p className={styles.blockLead}>
            Download the supplementary content to follow along and pick apart the finished result.
          </p>

          <a href={supp.scene.url} className={styles.sceneRow}>
            <div className={styles.dlIcon}>
              <MdDownload />
            </div>
            <div className={styles.dlMeta}>
              <span className={styles.dlName}>{supp.scene.name}</span>
              <span className={styles.dlNote}>{supp.scene.note}</span>
            </div>
          </a>

          <span className={styles.scansLabel}>Individual scans</span>
          <div className={styles.scanGrid}>
            {supp.scans.map((scan) => (
              <a key={scan.url} href={scan.url} className={styles.scanCard}>
                <MdDownload />
                <span>{scan.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default CourseInfo
