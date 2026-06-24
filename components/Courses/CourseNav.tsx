import Link from 'next/link'

// Simple chapter/lecture list used on the overview and lecture pages.
// Data-functional placeholder — no styling yet.
const CourseNav = ({ course, activeLecture = null }) => {
  return (
    <nav>
      <ol>
        {course.chapters.map((chapter) => (
          <li key={chapter.slug}>
            {chapter.name}
            <ol>
              {chapter.lectures.map((lecture) => (
                <li key={lecture.slug}>
                  {lecture.slug === activeLecture ? (
                    <strong>{lecture.name}</strong>
                  ) : (
                    <Link href={`/learn/${course.id}/${lecture.slug}`}>{lecture.name}</Link>
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default CourseNav
