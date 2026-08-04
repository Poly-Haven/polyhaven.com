import Link from 'next/link'
import apiSWR from 'utils/apiSWR'
import Button from 'components/UI/Button/Button'
import Patreon from 'components/UI/Icons/Patreon'
import Heart from 'components/UI/Icons/Heart'

import styles from './CourseMilestone.module.scss'

// Deterministic formatting (explicit locale) so SSR and client output match.
const fmt = (n: number) => n.toLocaleString('en-US')

const CourseMilestone = ({ patreonUrl }: { patreonUrl: string }) => {
  const { data } = apiSWR('/milestones', { revalidateOnFocus: false })

  const milestone = data?.milestones.find((m) => m.key === 'course_photogrammetry')
  const numPatrons: number | null = data?.numPatrons ?? null

  if (!milestone) return null

  const target = milestone.target
  const pct = numPatrons != null ? Math.min(100, (numPatrons / target) * 100) : 0
  const toGo = numPatrons != null ? Math.max(0, target - numPatrons) : null

  return (
    <div className={styles.milestone}>
      <h3>This is a paid course, for now.</h3>
      <p>Every asset on Poly Haven is free, and always will be, but making them costs a lot.</p>
      <p>
        Selling this course helps fund our work, the same way <Link href="/plugins/blender">our Blender add-on</Link>{' '}
        does.
        <br />
        <sup>(which you also get if you purchase the course through Patreon!)</sup>
      </p>
      <p>We don't want to keep it behind a paywall forever.</p>
      <p>
        Once we reach <strong>{fmt(target)} Patreon supporters</strong>, we'll release the entire course free to
        everyone. Join us, get the course, all the other Patreon perks, and help get there sooner.
      </p>

      <div
        className={styles.bar}
        role="progressbar"
        aria-valuenow={numPatrons ?? 0}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.barMeta}>
        <span>
          <Patreon color="#fff" />
          <strong>{numPatrons != null ? fmt(numPatrons) : '?'}</strong> / {fmt(target)} patrons
        </span>
      </div>
      {toGo != null && <p className={styles.toGo}>Only {fmt(toGo)} to go!</p>}

      <Button text="Get it on Patreon" href={patreonUrl} icon={<Heart />} color="pink" />
    </div>
  )
}

export default CourseMilestone
