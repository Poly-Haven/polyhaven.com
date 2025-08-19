import { useTranslation } from 'next-i18next'
import { filesize } from 'filesize'

import { GoLinkExternal } from 'react-icons/go'
import { MdImage } from 'react-icons/md'

import BackplateList from './BackplateList'
import DownloadMap from './DownloadMap'
import IconMacbeth from 'components/UI/Icons/Macbeth'
import IconPatreon from 'components/UI/Icons/Patreon'
import Tooltip from 'components/UI/Tooltip/Tooltip'

import { sortCaseInsensitive, sortByPreference } from 'utils/arrayUtils'
import threeDFormats from 'constants/3D_formats.json'

import styles from './DownloadOptions.module.scss'

const DownloadOptions = ({ open, assetID, tempUUID, files, res, fmt, selectMap, type, setPreview, callback }) => {
  const { t } = useTranslation('asset')

  const trackDownload = async (e) => {
    callback()
    const localUserDownloadCount = localStorage.getItem(`userDownloadCount`) || '0'
    localStorage.setItem(`userDownloadCount`, (parseInt(localUserDownloadCount) + 1).toString())
    const data = {
      uuid: localStorage.getItem(`uuid`) || tempUUID,
      asset_id: assetID,
      res: e.currentTarget.dataset.res,
      format: e.currentTarget.dataset.format,
    }
    await fetch(`/api/dlTrack`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((resdata) => {
        console.log('Tracked download:', data)
      })
  }

  const sortFiles = (files) => {
    files = sortByPreference(sortCaseInsensitive(Object.keys(files)), {
      blend: 1,
      gltf: 2,
      fbx: 3,
      usd: 4,
      mtlx: 5,
      'ANYTHING ELSE': 10,
    })
    return files
  }

  return (
    <div className={styles.wrapper}>
      <div id="download_options" className={`${styles.optionsWrapper} ${!open ? styles.optionsHidden : null}`}>
        {fmt === 'zip' ? <div className={styles.optionsHeader}>{t('asset:zip-choose')}</div> : null}
        {type === 0
          ? null
          : sortFiles(files).map((m, i) =>
              !threeDFormats.includes(m) || fmt === 'zip' ? (
                <DownloadMap
                  key={i}
                  name={m}
                  res={res}
                  fmt={fmt}
                  type={type}
                  data={files[m][res]}
                  trackDownload={trackDownload}
                  selectMap={selectMap}
                />
              ) : null
            )}
        {type === 0 && files['tonemapped'] ? (
          <>
            <div className={`${styles.optionRow} ${styles.wideOptionRow}`} data-tip={t('asset:formats.tm')}>
              <a
                href={files['tonemapped'].url}
                className={styles.format}
                target="_blank"
                rel="noopener"
                data-res="tm"
                onClick={trackDownload}
              >
                8K Tonemapped JPG • {filesize(files['tonemapped'].size).toString()}
              </a>
            </div>
          </>
        ) : null}
        <div className={`${styles.optionRow} ${styles.wideOptionRow}`} data-tip={t('asset:formats.thumb-d')}>
          <a
            href={`https://cdn.polyhaven.com/asset_img/thumbs/${assetID}.png?format=png`}
            className={styles.format}
            target="_blank"
            rel="noopener"
            data-res="thumb"
            onClick={trackDownload}
          >
            <MdImage />
            {t('asset:formats.thumb')}
          </a>
        </div>
        {type === 0 && files['colorchart'] ? (
          <>
            <div className={`${styles.optionRow} ${styles.wideOptionRow}`}>
              <a
                href={files['colorchart'].url}
                className={styles.format}
                target="_blank"
                rel="noopener"
                data-res="cc"
                onClick={trackDownload}
              >
                <IconMacbeth />
                Color Chart • {filesize(files['colorchart'].size).toString()}
              </a>
            </div>
          </>
        ) : null}
        <div className={`${styles.optionRow} ${styles.wideOptionRow}`} data-tip={t('asset:cloud-sync-d')}>
          <a href="https://www.patreon.com/polyhaven/overview" className={styles.format} target="_blank">
            <IconPatreon />
            {t('asset:cloud-sync')} <GoLinkExternal style={{ marginLeft: '0.5em' }} />
          </a>
        </div>
        {type === 0 && files['backplates'] ? (
          <BackplateList
            assetID={assetID}
            files={files['backplates']}
            trackDownload={trackDownload}
            setPreview={setPreview}
          />
        ) : null}
      </div>
      <Tooltip />
    </div>
  )
}

export default DownloadOptions
