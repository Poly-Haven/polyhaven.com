import Link from 'next/link';
import styles from './AssetPage.module.scss'

import Tooltip from 'components/Tooltip/Tooltip';

const InfoBlock = ({ value, label, condition, link, tip }) => {
  if (condition) {
    return (<>
      {link ?
        <Link href={link}><a className={styles.infoBlock} data-tip={tip} data-for="InfoBlock">
          <strong>{value}</strong>
          <p>{label}</p>
        </a></Link>
        :
        <div className={styles.infoBlock} data-tip={tip} data-for="InfoBlock">
          <strong>{value}</strong>
          <p>{label}</p>
        </div>
      }
      <Tooltip place="left" id="InfoBlock" />
    </>)
  } else {
    return null
  }
}

InfoBlock.defaultProps = {
  condition: true,
  link: null,
  tip: null,
}

export default InfoBlock
