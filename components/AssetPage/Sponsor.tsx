import useSWR from 'swr';
import fetcher from 'utils/fetcher';

import { MdHelp } from 'react-icons/md'

import Tooltip from 'components/Tooltip/Tooltip'

import styles from './AssetPage.module.scss'

const Sponsor = ({ assetID, sponsors }) => {
  let sponsorData = []
  sponsors = sponsors || [{ name: "No one yet :(" }];
  for (const s of sponsors) {
    if (typeof s === 'object') {
      sponsorData.push(s)
    } else {
      const { data, error } = useSWR(`https://api.polyhaven.com/sponsor/${s}`, fetcher, { revalidateOnFocus: false });
      if (!error && data) {
        sponsorData.push(data)
      }
    }
  }

  return (
    <div className={styles.sponsor}>
      <Tooltip />
      <h4>Sponsored by: <a href="https://www.patreon.com/hdrihaven/overview" data-tip="Support Poly Haven on Patreon to add your name here."><MdHelp /></a></h4>
      {sponsorData.length ?
        sponsorData.map((s, i) => <p key={i}>{
          s.url ?
            <a href={s.url} rel="nofollow">{s.name}</a>
            : s.name
        }</p>)
        : null}
    </div>
  )
}

export default Sponsor
