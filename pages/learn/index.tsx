// /learn is unused for now — redirect to the only course.
// TODO: turn this into a real course list once there's more than one course.
export default function LearnIndex() {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/learn/photogrammetry',
      permanent: false,
    },
  }
}
