import { useTranslation } from 'next-i18next'
import { MdHelp } from 'react-icons/md'
import apiSWR from 'utils/apiSWR'

import Tooltip from 'components/UI/Tooltip/Tooltip'
import AddSponsor from './AddSponsor'

import styles from './AssetPage.module.scss'

const Sponsor = ({ assetID, sponsors, patron }) => {
  const { t } = useTranslation('asset');
  let sponsorData = []
  sponsors = sponsors || [{ name: t('sponsored-by-none') }];
  for (const s of sponsors) {
    if (typeof s === 'object') {
      sponsorData.push(s)
    } else {
      const { data, error } = apiSWR(`/sponsor/${s}`, { revalidateOnFocus: false });
      if (!error && data) {
        sponsorData.push(data)
      }
    }
  }

  return (
    <div className={styles.sponsor}>
      <h4>{t('sponsored-by')} <a href="https://www.patreon.com/polyhaven/overview" data-tip={t('sponsored-by-d')}><MdHelp /></a></h4>
      {sponsorData.length ?
        sponsorData.map((s, i) => <p key={i}>{
          s.url ?
            <a href={s.url} rel="nofollow noopener">{
              s.logo ?
                <img src={`https://cdn.polyhaven.com/corporate_sponsors/${s.logo}`} alt={s.name} title={s.name} className={styles.corpSponsor} />
                : s.name
            }</a>
            : s.name
        }</p>)
        : null}
      {patron.rewards && patron.rewards.includes('Sponsor') && !sponsors.includes(patron.uuid) && <AddSponsor assetID={assetID} patron={patron} />}
      <Tooltip />
    </div>
  )
}

export default Sponsor
