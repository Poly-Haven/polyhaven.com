import { useTranslation, Trans } from 'next-i18next'
import { useState, useEffect, useReducer } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { filesize } from 'filesize'
import { v4 as uuid } from 'uuid'
import apiSWR from 'utils/apiSWR'

import { MdFileDownload, MdMenu, MdArrowBack, MdInfo } from 'react-icons/md'
import { GoFileZip } from 'react-icons/go'
import { IoMdUnlock } from 'react-icons/io'

import Button from 'components/UI/Button/Button'
import Dropdown from 'components/UI/Dropdown/Dropdown'
import DownloadOptions from './DownloadOptions'
import Loader from 'components/UI/Loader/Loader'
import Spinner from 'components/UI/Spinner/Spinner'
import IconBlender from 'components/UI/Icons/Blender'
import IconGltf from 'components/UI/Icons/glTF'
import IconUSD from 'components/UI/Icons/USD'
import IconMaterialX from 'components/UI/Icons/MaterialX'
import IconFile from 'components/UI/Icons/File'
import HeartLock from 'components/UI/Icons/HeartLock'
import Heart from 'components/UI/Icons/Heart'
import Tooltip from 'components/UI/Tooltip/Tooltip'

import { sortRes } from 'utils/arrayUtils'
import { urlBaseName } from 'utils/stringUtils'
import threeDFormats from 'constants/3D_formats.json'
import { useUserPatron } from 'contexts/UserPatronContext'

import styles from './Download.module.scss'

// Just to keep TS happy, this function exists in /public/download-js/download.js, which is loaded in _document.tsx
declare const startDownload

const Download = ({ assetID, data, files, setPreview, patron, texelDensity, callback, vault, scheduleText }) => {
  const { t } = useTranslation('asset')
  const router = useRouter()
  const { earlyAccess } = useUserPatron()
  const [busyDownloading, setBusyDownloading] = useState(false)
  const [dlOptions, setDlOptions] = useState(false)
  const [zipList, dispatch] = useReducer(reducer, { files: [] })
  const [prefRes, setRes] = useState('4k')
  const [prefFmt, setFmt] = useState('exr')
  const [tempUUID, setTempUUID] = useState(uuid())
  const [isClient, setIsClient] = useState(false)

  const [currentPatrons, setCurrentPatrons] = useState(0)
  const [targetPatrons, setTargetPatrons] = useState(0)
  const [totalVaultedAssets, setTotalVaultedAssets] = useState(0)
  const [numEaAssets, setNumEaAssets] = useState(0)

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Only fetch milestones when needed
  const { data: milestones, error: milestonesError } = apiSWR(
    vault || data.date_published * 1000 > Date.now() ? '/milestones' : null,
    { revalidateOnFocus: false }
  )

  // Only fetch vaults when needed
  const { data: vaults, error: vaultsError } = apiSWR(vault ? '/vaults' : null, { revalidateOnFocus: false })

  useEffect(() => {
    if (milestones && !milestonesError) {
      setCurrentPatrons(milestones.numPatrons)
      setNumEaAssets(milestones.numEaAssets)
    }
  }, [milestones, milestonesError])

  useEffect(() => {
    if (vaults && !vaultsError) {
      if (vaults[vault]) {
        setTargetPatrons(vaults[vault].target)
      }
      let totalAssets = 0
      for (const v of Object.values(vaults)) {
        if (v['assets']) {
          totalAssets += v['assets'].length
        }
      }
      setTotalVaultedAssets(totalAssets)
    }
  }, [vaults, vaultsError, vault])

  const isHDRI = data.type === 0

  function reducer(state, action) {
    const data = action.key
    if (action.add) {
      for (const f of state.files) {
        if (data.md5 === f.md5) {
          return { files: state.files }
        }
      }
      return { files: [...state.files, data] }
    } else {
      return { files: state.files.filter((k) => k.md5 !== data.md5) }
    }
  }

  const selectMap = (key, add) => {
    dispatch({ key, add })
  }

  useEffect(() => {
    setRes(localStorage.getItem(`assetPref_${data.type}_resolution`) || '4k')
    setFmt(localStorage.getItem(`assetPref_${data.type}_format`) || 'exr')
  }, [prefRes, prefFmt])

  if (!files) {
    return (
      <div className={styles.downloadBtnWrapper}>
        <div className={styles.downloadBtn}>
          <span className={styles.error}>
            No files?
            <br />
            <em>Try refresh, otherwise please report this to us.</em>
          </span>
        </div>
      </div>
    )
  }

  // Asset is vaulted, user is not a patron
  if (vault && !earlyAccess) {
    if (!patron.rewards || !patron.rewards.includes('Early Access')) {
      return (
        <div className={styles.unreleased}>
          <h3>
            <HeartLock /> {t('asset:vaulted.title')}
          </h3>
          <p>
            <Trans
              i18nKey="asset:vaulted.locked-in"
              t={t}
              values={{ vault }}
              components={{ vaultLink: <Link href={`/vaults/${vault}`} /> }}
            />
          </p>
          {targetPatrons && currentPatrons ? (
            <>
              <p>
                <strong>
                  <Trans
                    i18nKey="asset:vaulted.donate-access"
                    t={t}
                    values={{ totalVaultedAssets: totalVaultedAssets ? totalVaultedAssets - 1 : null }}
                  />
                </strong>
              </p>
              <p>
                <Trans
                  i18nKey="asset:vaulted.patrons-needed"
                  t={t}
                  values={{ remaining: targetPatrons && currentPatrons ? targetPatrons - currentPatrons : null }}
                />
              </p>
            </>
          ) : (
            <Spinner />
          )}

          <div className={styles.buttonRow}>
            <Button text={t('asset:vaulted.about')} href="/vaults" icon={<MdInfo />} color="hollowRed" />
            <Button
              text={t('asset:vaulted.access-now')}
              href="https://www.patreon.com/checkout/polyhaven"
              icon={<IoMdUnlock />}
              color="red"
            />
          </div>

          <p style={{ marginTop: '-0.8em', opacity: 0.75, fontSize: '0.8em' }}>
            <Trans
              i18nKey="asset:vaulted.already-patron"
              t={t}
              components={{ loginLink: <Link href={`/account?returnTo=${router.asPath}`} /> }}
            />
          </p>
        </div>
      )
    }
  }

  // Asset is not released yet, user is not a patron
  if (isClient && data.date_published * 1000 > Date.now() && !earlyAccess) {
    if (!patron.rewards || !patron.rewards.includes('Early Access')) {
      return (
        <div className={styles.unreleased}>
          <h3>
            <Heart color="#F96854" /> {t('asset:early-access.title')}
          </h3>
          <p>
            <Trans
              i18nKey="asset:early-access.release-date"
              t={t}
              values={{ scheduleText }}
              components={{ strong: <strong /> }}
            />
          </p>
          {numEaAssets ? (
            <p>
              <Trans
                i18nKey="asset:early-access.donate-access"
                t={t}
                values={{ numEaAssets: numEaAssets ? numEaAssets - 1 : null }}
              />
            </p>
          ) : (
            <Spinner />
          )}

          <Button
            text={t('asset:early-access.get-access')}
            href="https://www.patreon.com/checkout/polyhaven"
            icon={<IoMdUnlock />}
            color="red"
          />

          <p style={{ marginTop: '-0.8em', opacity: 0.75, fontSize: '0.8em' }}>
            <Trans
              i18nKey="asset:early-access.already-patron"
              t={t}
              components={{ loginLink: <Link href={`/account?returnTo=${router.asPath}`} /> }}
            />
          </p>
        </div>
      )
    }
  }

  // Find a key that we can use to fetch available resolutions and formats.
  let baseKey = 'UNKNOWN'
  const baseKeys = ['hdri', 'blend', 'Diffuse', 'nor_gl', 'Rough', 'Displacement']
  for (const k of baseKeys) {
    if (Object.keys(files).includes(k)) {
      baseKey = k
      break
    }
  }
  if (baseKey === 'UNKNOWN') {
    return (
      <div className={styles.downloadBtnWrapper}>
        <div className={styles.downloadBtn}>baseKey unknown!</div>
      </div>
    )
  }

  const toggleDlOptions = () => {
    setDlOptions(!dlOptions)
  }

  const resOptionKeys = sortRes(Object.keys(files[baseKey]))
  const resOptions = {}
  const maxRes = parseInt(resOptionKeys.slice(-1)[0])
  for (const r of resOptionKeys) {
    resOptions[r] = {
      label: r.toUpperCase(),
      sub: texelDensity ? `${parseFloat(((texelDensity * (parseInt(r) / maxRes)) / 100).toFixed(1))}px/cm` : null,
    }
  }
  const setResValue = (v) => {
    setRes(v)
    localStorage.setItem(`assetPref_${data.type}_resolution`, v)
  }
  const dlRes = resOptionKeys.includes(prefRes) ? prefRes : resOptionKeys.slice(-1)[0]

  // Gather backplate previews
  let backplates = []
  if (files['backplates']) {
    for (const bp of Object.keys(files['backplates'])) {
      if (backplates.length >= 7) {
        break // Limit to 7
      }
      if (files['backplates'][bp]['jpg_pretty']) {
        const fileName = files['backplates'][bp]['jpg_pretty']['url'].split('/').pop()
        backplates.push(`https://cdn.polyhaven.com/asset_img/backplates/${assetID}/${fileName}?height=32&quality=95`)
      }
    }
  }

  const fmtOptions = isHDRI
    ? {
        hdr: {
          label: 'HDR',
          tooltip: `Radiance RGBE (.hdr)<br/>${t('formats.hdr')}`,
        },
        exr: {
          label: 'EXR',
          tooltip: `Open EXR (.exr)<br/>${t('formats.exr')}`,
        },
      }
    : {
        blend: {
          label: 'Blend',
          tooltip: `Blender<br/>${t('formats.incl-tex')}`,
          icon: <IconBlender />,
        },
        gltf: {
          label: 'glTF',
          tooltip: `glTF 2.0, ${t('formats.some-software')}<br/>${t('formats.incl-tex')}`,
          icon: <IconGltf />,
        },
        usd: {
          label: 'USD',
          tooltip: `Universal Scene Description, ${t('formats.most-software')}`,
          icon: <IconUSD />,
        },
        fbx: {
          label: 'FBX',
          tooltip: `Autodesk FBX, ${t('formats.most-software')}`,
          icon: <IconFile text="F" />,
        },
        mtlx: {
          label: 'MaterialX',
          tooltip: `MaterialX, ${t('formats.some-software')}<br/>${t('formats.incl-tex')}`,
          icon: <IconMaterialX />,
        },
        zip: {
          label: 'ZIP',
          tooltip: t('formats.zip'),
          icon: <GoFileZip />,
        },
      }
  const optionalFormats = ['gltf', 'fbx', 'usd', 'mtlx']
  for (const f of optionalFormats) {
    if (!Object.keys(files).includes(f)) {
      delete fmtOptions[f]
    }
  }

  const setFmtValue = (v) => {
    setFmt(v)
    localStorage.setItem(`assetPref_${data.type}_format`, v)
    if (v === 'zip') {
      setDlOptions(true)
    }
  }
  const dlFmt = Object.keys(fmtOptions).includes(prefFmt) ? prefFmt : isHDRI ? 'hdr' : 'blend'

  let fsize = 0
  if (dlFmt !== 'zip') {
    const fileInfo = files[isHDRI ? 'hdri' : dlFmt][dlRes][dlFmt]
    fsize = fileInfo.size
    if (fileInfo.include) {
      for (const i of Object.values(fileInfo.include)) {
        fsize += i['size']
      }
    }
  } else {
    for (const f of zipList.files) {
      if (files[f.map]) {
        const fileInfo = files[f.map][dlRes][f.fmt]
        fsize += fileInfo.size
        if (f.map === 'gltf') {
          fsize += files[f.map][dlRes][f.fmt].include[`${assetID}.bin`].size
        }
      }
    }
  }

  const trackDownload = async () => {
    callback()
    const localUserDownloadCount = localStorage.getItem(`userDownloadCount`) || '0'
    localStorage.setItem(`userDownloadCount`, (parseInt(localUserDownloadCount) + 1).toString())
    const data = {
      uuid: localStorage.getItem(`uuid`) || tempUUID,
      asset_id: assetID,
      res: dlRes,
      format: dlFmt,
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

  const downloadZip = async () => {
    if (busyDownloading) {
      return
    }
    setBusyDownloading(true)
    let name = `${assetID}_${dlRes}`
    let dlFiles = []
    if (dlFmt !== 'zip') {
      const fileInfo = files[dlFmt][dlRes][dlFmt]
      name = urlBaseName(fileInfo.url)
      dlFiles.push({
        url: fileInfo.url,
        size: fileInfo.size,
        path: name,
      })
      if (fileInfo.include) {
        for (const path of Object.keys(fileInfo.include)) {
          dlFiles.push({
            url: fileInfo.include[path].url,
            size: fileInfo.include[path].size,
            path: path,
          })
        }
      }
    } else {
      for (const f of zipList.files) {
        const basePath = threeDFormats.includes(f.fmt) ? '' : 'textures/'
        const fileInfo = files[f.map][dlRes][f.fmt]
        dlFiles.push({
          url: fileInfo.url,
          size: fileInfo.size,
          path: basePath + urlBaseName(fileInfo.url),
        })
        if (f.map === 'gltf') {
          const binInfo = fileInfo.include[`${assetID}.bin`]
          dlFiles.push({
            url: binInfo.url,
            size: binInfo.size,
            path: basePath + urlBaseName(binInfo.url),
          })
        }
      }
    }
    startDownload(name, dlFiles)

    await new Promise((r) => setTimeout(r, 2000)).then((_) => {
      // Purely for a visual indication that something is happending, and to prevent accidental double clicks.
      setBusyDownloading(false)
    })
    await trackDownload()
  }

  return (
    <div>
      <div className={styles.downloadBtnWrapper}>
        <Dropdown value={dlRes} options={resOptions} onChange={setResValue} small={true} tooltipID="dropdown-res" />

        <Dropdown
          value={dlFmt}
          options={fmtOptions}
          onChange={setFmtValue}
          small={true}
          tooltipSide="left"
          tooltipID="dropdown-fmt"
        />

        <a
          href={isHDRI ? files['hdri'][dlRes][dlFmt].url : null}
          target="_blank"
          rel="noopener"
          className={`${styles.downloadBtn} ${busyDownloading ? styles.disabled : null}`}
          onClick={isHDRI ? trackDownload : downloadZip}
        >
          <MdFileDownload />
          <div>
            <h3>{t('download')}</h3>
            <p>{filesize(fsize).toString()}</p>
          </div>
          <div className={`${styles.busyDownloading} ${busyDownloading ? styles.show : null}`}>
            <Loader />
          </div>
        </a>
        <div className={styles.downloadBtnSml} onClick={toggleDlOptions}>
          {dlOptions ? <MdArrowBack /> : <MdMenu />}
        </div>
      </div>

      {backplates.length > 0 ? (
        <div className={styles.backplatePreviews} onClick={toggleDlOptions}>
          <strong>{t('backplates')}:</strong>
          {backplates.map((bp, i) => (
            <img key={i} src={bp} />
          ))}
          <div className={styles.fadeOut} />
        </div>
      ) : null}

      <DownloadOptions
        open={dlOptions}
        assetID={assetID}
        tempUUID={tempUUID}
        files={files}
        res={dlRes}
        fmt={dlFmt}
        selectMap={selectMap}
        type={data.type}
        setPreview={setPreview}
        callback={callback}
      />
      <Tooltip id="dropdown" place="left" />
    </div>
  )
}

Download.defaultProps = {
  vault: null,
}

export default Download
