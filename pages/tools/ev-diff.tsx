import TextPage from 'components/Layout/TextPage/TextPage'
import EvDiff from 'components/EvDiff/EvDiff';

const Page = () => {
  return (
    <TextPage
      title="EV Difference Calculator"
      description="Use this page to calculate the exposure difference in stops/EVs between two images by inputting the shutter speed, aperture, ISO and ND filter reduction (if any)."
      url="/tools/ev-diff"
    >
      <EvDiff />
    </TextPage>
  )
}

export default Page