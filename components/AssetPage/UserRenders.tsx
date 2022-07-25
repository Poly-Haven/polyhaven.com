import { useTranslation, Trans } from 'next-i18next';
import Link from 'next/link';
import apiSWR from 'utils/apiSWR'

import IconButton from 'components/UI/Button/IconButton';
import Spinner from 'components/Spinner/Spinner'
import Gallery from 'components/Gallery/Gallery'

import { MdAdd } from "react-icons/md";

import styles from './AssetPage.module.scss'

const UserRenders = ({ assetID }) => {
  const { t } = useTranslation('asset');
  const titleRowJsx = <div className={styles.userRendersTitle}>
    <h1>{t('user-renders')}</h1>
    <Link href={`/gallery-submit?asset=${assetID}`} prefetch={false}><a><IconButton icon={<MdAdd />} label={t('add-yours')} /></a></Link>
  </div>

  const { data, error } = apiSWR(`/gallery?assetID=${assetID}`, { revalidateOnFocus: false });
  if (error) {
    return null
  } else if (!data) {
    return <div className={styles.userRenders}>
      {titleRowJsx}
      <Spinner />
    </div>
  }

  return (
    <div className={styles.userRenders}>
      {titleRowJsx}
      {data.length ?
        <Gallery data={data} assetPage={true} />
        :
        <p><Trans
          i18nKey="no-renders"
          t={t}
          components={{ lnk: <a href={`/gallery-submit?asset=${assetID}`} /> }}
        /></p>}
    </div>
  )
}

export default UserRenders
