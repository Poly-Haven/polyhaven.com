import Link from 'next/link';
import CorporateSponsorLogo from './CorporateSponsorLogo'
import Spinner from 'components/Spinner/Spinner'

import apiSWR from 'utils/apiSWR'

import { MdInfoOutline } from 'react-icons/md'

import styles from './CorporateSponsors.module.scss'

const CorporateSponsors = ({ header, home, hideInfoBtn }) => {
  const { data, error } = apiSWR("/corporate", { revalidateOnFocus: false });
  if (error) return <div className={styles.wrapper}>Error fetching corporate sponsors</div>
  if (!data) return <div className={styles.wrapper}><Spinner /></div>

  const sortedKeys = Object.keys(data).sort((a, b) => data[a].name.localeCompare(data[b].name))

  const diamondSponsors = sortedKeys.filter(s => data[s].rank === 3);
  const goldSponsors = sortedKeys.filter(s => data[s].rank === 2);

  let silverSponsors = [];
  if (!home) {
    silverSponsors = sortedKeys.filter(s => data[s].rank === 1);
  }

  return (
    <div className={styles.wrapper}>
      <h2>{header}{!hideInfoBtn && <Link href="/corporate"><a><MdInfoOutline /></a></Link>}</h2>
      <div className={styles.groupDiamond}>
        {diamondSponsors.map(id => {
          return (
            <CorporateSponsorLogo key={id} id={id} data={data[id]} />
          )
        })}
      </div>
      <div className={styles.groupGold}>
        {goldSponsors.map(id => {
          return (
            <CorporateSponsorLogo key={id} id={id} data={data[id]} />
          )
        })}
      </div>
      <div className={styles.groupSilver}>
        {silverSponsors.map(id => {
          return (
            <CorporateSponsorLogo key={id} id={id} data={data[id]} />
          )
        })}
      </div>
    </div>
  )
}

CorporateSponsors.defaultProps = {
  header: "Also supported by:",
  home: false,
  hideInfoBtn: false
}

export default CorporateSponsors
