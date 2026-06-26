import Link from 'next/link'
import { useRouter } from 'next/router'

import { useUserPatron } from 'contexts/UserPatronContext'
import CourseNav from './CourseNav'
import Photogrammetry from './Photogrammetry'

// Per-course bespoke overview bodies (hard-coded JSX, like the plugin pages). Each
// bespoke body owns the whole page (its own hero, CTAs, curriculum, etc.).
const overviews = {
  photogrammetry: Photogrammetry,
}

const CoursesLanding = ({ course }) => {
  const Body = overviews[course.id]
  if (Body) return <Body course={course} />

  // Generic fallback for any course without a bespoke marketing page yet.
  return <GenericOverview course={course} />
}

const GenericOverview = ({ course }) => {
  const { user } = useUserPatron()
  const router = useRouter()
  const firstLecture = course.chapters?.[0]?.lectures?.[0]?.slug

  return (
    <div>
      <h1>{course.name}</h1>
      <p>{course.description}</p>

      <p>
        {user ? (
          firstLecture && <Link href={`/learn/${course.id}/${firstLecture}`}>Watch</Link>
        ) : (
          <Link href={`/account?returnTo=${encodeURIComponent(router.asPath)}`}>Sign up to watch</Link>
        )}
      </p>

      <CourseNav course={course} />
    </div>
  )
}

export default CoursesLanding
