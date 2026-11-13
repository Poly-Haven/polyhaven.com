import { useTranslation } from 'next-i18next'
import { MdHelp } from 'react-icons/md'

import AddSponsor from './AddSponsor'
import Sponsor from './Sponsor'

import styles from '../AssetPage.module.scss'

const SponsorList = ({ assetID, sponsors, patron }) => {
  const { t } = useTranslation('asset')
  let sponsorData = []
  sponsors = sponsors || [{ name: t('sponsored-by-none') }]
  for (const s of sponsors) {
    if (typeof s === 'object') {
      sponsorData.push(<p>{s.name || s}</p>)
    } else {
      sponsorData.push(<Sponsor id={s} />)
    }
  }

  return (
    <div className={styles.sponsor}>
      <h4>
        {t('sponsored-by')}{' '}
        <a
          href="https://www.patreon.com/polyhaven/join?cadence=12"
          data-tip={t('sponsored-by-d')}
          aria-label={t('sponsored-by-d')}
        >
          <MdHelp />
        </a>
      </h4>
      {sponsorData.length ? sponsorData.map((s, i) => <span key={i}>{s}</span>) : null}
      {/* Any active patron with unspent tokens can sponsor, whatever their current tier: tokens outlive a
      tier change. `rewards` is only non-empty for an active patron (pages/api/patronInfo), so a lapsed
      patron's banked tokens stay hidden. AddSponsor renders nothing when none are left. The sponsor list
      holds Patreon `uid`s; the token map also covers a sponsorship the cached list doesn't show yet. */}
      {patron.rewards?.length > 0 &&
        patron.sponsor_tokens &&
        !sponsors.includes(patron.uid) &&
        !Object.values(patron.sponsor_tokens).includes(assetID) && (
        <AddSponsor assetID={assetID} patron={patron} />
      )}
    </div>
  )
}

export default SponsorList
