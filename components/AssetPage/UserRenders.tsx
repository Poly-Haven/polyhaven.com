import { useTranslation, Trans } from 'next-i18next'
import Link from 'next/link'
import apiSWR from 'utils/apiSWR'

import IconButton from 'components/UI/Button/IconButton'
import Spinner from 'components/UI/Spinner/Spinner'
import Gallery from 'components/Gallery/Gallery'

import { MdAdd } from 'react-icons/md'

import styles from './AssetPage.module.scss'

const UserRenders = ({ assetID }) => {
  const { t } = useTranslation('asset')
  const titleRowJsx = (
    <div className={styles.userRendersTitle}>
      <h1>{t('asset:user-renders')}</h1>
      <Link href={`/gallery-submit?asset=${assetID}`} prefetch={false}>
        <IconButton icon={<MdAdd />} label={t('asset:add-yours')} />
      </Link>
    </div>
  )

  const { data, error } = apiSWR(`/gallery?assetID=${assetID}`, { revalidateOnFocus: false })
  if (error || !data) {
    return null
  }

  if (data.length === 0) {
    // Hide the whole section if there are no user renders - much of the spam we deal with comes from this empty section
    return null
  }

  return (
    <div className={styles.userRenders}>
      {titleRowJsx}
      <Gallery data={data} assetPage={true} />
    </div>
  )
}

export default UserRenders
