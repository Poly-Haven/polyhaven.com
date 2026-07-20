// The Unreal HDRI Browser plugin has been removed — redirect to the tools page.
export default function UnrealPlugin() {
  return null
}

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/tools',
      permanent: false,
    },
  }
}
