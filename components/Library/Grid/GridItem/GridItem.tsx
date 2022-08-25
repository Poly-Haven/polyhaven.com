import { useTranslation } from 'next-i18next';
import Link from 'next/link'
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { timeago } from 'utils/dateUtils';

import { MdCollections } from 'react-icons/md';

import { daysOld } from 'utils/dateUtils'
import IconPatreon from 'components/UI/Icons/Patreon'
import SimpleAuthorCredit from 'components/Library/Grid/SimpleAuthorCredit';

import styles from './GridItem.module.scss';

const GridItem = ({ asset, assetID, onClick, blurUpcoming, scrollPosition }) => {
  const { t: tt } = useTranslation('time');
  const { t } = useTranslation('library');

  let size = [371, 278];
  if (asset.type === 1) {
    size = [285, 285]
  } else if (asset.type === 2) {
    size = [450, 300]
  }

  const blur = blurUpcoming && daysOld(asset.date_published) < 0

  let badge;
  if (daysOld(asset.date_published) < 0) {
    badge = {
      text: <><IconPatreon />{t('early-access')}</>,
      style: styles.soon,
      tooltip: t("$3+ Patrons can log in to download early")
    }
  } else if (daysOld(asset.date_published) < 7) {
    badge = {
      text: t('new'),
      style: styles.new
    }
  }

  let indicators = []
  if (asset.backplates) {
    indicators.push({
      text: `✔ Backplates: ${t('backplates')}`,
      icon: <MdCollections />,
    })
  }

  const img_src = `https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?width=${size[0]}&height=${size[1]}`
  return (
    <Link href="/a/[id]" as={`/a/${assetID}`}><a className={`${styles.gridItem} ${blur ? styles.blur : ''}`} onClick={onClick}>
      <div className={styles.author}>
        <div className={styles.authorInner}>
          {Object.keys(asset.authors).sort().map(a => <SimpleAuthorCredit key={a} id={a} donated={asset.donated} />)}
        </div>
      </div>
      <div className={styles.thumb}><LazyLoadImage
        src={img_src}
        alt={asset.name}
        scrollPosition={scrollPosition}
        threshold={500}
        placeholder={<div className={styles.skelly}></div>}
      /></div>
      <div className={styles.text}>
        <h3>{asset.name}</h3>
        <p>{timeago(asset.date_published * 1000, tt)}</p>
      </div>
      {badge ? <div className={`${styles.badge} ${badge.style}`} title={badge.tooltip}>{badge.text}</div> : null}
      <div className={styles.indicators}>{indicators.map(i => <div key={i.text} title={i.text} className={styles.indicator}>{i.icon}</div>)}</div>
    </a></Link>
  );
}

GridItem.defaultProps = {
  onClick: null,
  blurUpcoming: true,
}

export default GridItem;