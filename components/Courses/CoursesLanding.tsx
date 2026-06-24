import Link from 'next/link'
import { useRouter } from 'next/router'

import { useUserPatron } from 'contexts/UserPatronContext'
import CourseNav from './CourseNav'
import Photogrammetry from './Photogrammetry'

// Per-course bespoke overview bodies (hard-coded JSX, like the plugin pages).
const overviews = {
  photogrammetry: Photogrammetry,
}

// Public course overview ("landing"). Data-functional placeholder — no styling yet.
const CoursesLanding = ({ course }) => {
  const { user } = useUserPatron()
  const router = useRouter()

  const Body = overviews[course.id] || null
  const firstLecture = course.chapters?.[0]?.lectures?.[0]?.slug

  return (
    <div>
      <h1>{course.name}</h1>

      {Body ? <Body /> : <p>{course.description}</p>}

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
