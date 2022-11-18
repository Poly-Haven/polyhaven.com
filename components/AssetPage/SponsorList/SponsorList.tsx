import { useTranslation } from 'next-i18next'
import { MdHelp } from 'react-icons/md'

import Tooltip from 'components/UI/Tooltip/Tooltip'
import AddSponsor from './AddSponsor'
import Sponsor from './Sponsor'

import styles from '../AssetPage.module.scss'

const SponsorList = ({ assetID, sponsors, patron }) => {
  const { t } = useTranslation('asset');
  let sponsorData = []
  sponsors = sponsors || [{ name: t('sponsored-by-none') }];
  for (const s of sponsors) {
    if (typeof s === 'object') {
      sponsorData.push(<p>{s.name || s}</p>)
    } else {
      sponsorData.push(<Sponsor id={s} />)
    }
  }

  return (
    <div className={styles.sponsor}>
      <h4>{t('sponsored-by')} <a href="https://www.patreon.com/polyhaven/overview" data-tip={t('sponsored-by-d')}><MdHelp /></a></h4>
      {sponsorData.length ?
        sponsorData.map((s, i) => s)
        : null}
      {patron.rewards && patron.rewards.includes('Sponsor') && !sponsors.includes(patron.uuid) && <AddSponsor assetID={assetID} patron={patron} />}
      <Tooltip />
    </div>
  )
}

export default SponsorList
