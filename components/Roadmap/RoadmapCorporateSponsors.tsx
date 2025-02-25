import Link from 'next/link'
import CorporateSponsorLogo from 'components/CorporateSponsors/CorporateSponsorLogo'
import Spinner from 'components/UI/Spinner/Spinner'

import apiSWR from 'utils/apiSWR'

import styles from './Roadmap.module.scss'

const RoadmapCorporateSponsors = () => {
  const { data, error } = apiSWR('/corporate', { revalidateOnFocus: false })
  if (error) return <div className={styles.sponsors}>Error fetching corporate sponsors</div>
  if (!data)
    return (
      <div className={styles.sponsors}>
        <Spinner />
      </div>
    )

  const sortedKeys = Object.keys(data).sort((a, b) => data[a].name.localeCompare(data[b].name))

  const diamondSponsors = sortedKeys.filter((s) => data[s].rank === 3)
  const goldSponsors = sortedKeys.filter((s) => data[s].rank === 2)

  return (
    <div className={styles.sponsors}>
      <p>
        <Link href="/corporate">Also supported by</Link>:
      </p>
      {diamondSponsors.length ? (
        <>
          {diamondSponsors.map((id) => {
            return <CorporateSponsorLogo key={id} id={id} data={data[id]} className={styles.diamondSponsor} />
          })}
        </>
      ) : null}
      {goldSponsors.length ? (
        <>
          {goldSponsors.map((id) => {
            return <CorporateSponsorLogo key={id} id={id} data={data[id]} className={styles.goldSponsor} />
          })}
        </>
      ) : null}
    </div>
  )
}

export default RoadmapCorporateSponsors
