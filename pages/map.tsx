import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'

import dynamic from 'next/dynamic';
const Map = dynamic(() => import('../components/Map/Map'), {
  ssr: false
});

const MapPage = ({ data }) => {
  return (
    <Page>
      <Head
        title="Map"
        description="World map of locations where we've captured HDRIs."
        url="/map"
      />
      <Map hdris={data} />
    </Page>
  )
}

function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.ok);
  }
  return response;
}

export const getStaticProps = async (ctx) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://lbtest.polyhaven.com"
  const data = await fetch(`${baseUrl}/assets?t=hdris`)
    .then(handleErrors)
    .then(response => response.json())
    .catch(e => console.log(e));

  for (const [slug, info] of Object.entries(data)) {
    if (!info['coords']) {
      delete data[slug]
    }
  }

  return {
    props: { data },
    revalidate: 60 * 30 // 30 minutes
  }
}

export default MapPage