// /plugins is unused for now — redirect to the only plugin.
export default function PluginsIndex() {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/plugins/blender',
      permanent: false,
    },
  }
}
