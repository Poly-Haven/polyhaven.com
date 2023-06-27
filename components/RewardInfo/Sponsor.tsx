import { useState, useEffect } from 'react'
import { isEmail, isURL } from 'validator'
import { setPatronInfo } from 'utils/patronInfo'
import { useTranslation, Trans } from 'next-i18next'

import { IoTicket } from 'react-icons/io5'
import { MdCheck, MdSave } from 'react-icons/md'

import Switch from 'components/UI/Switch/Switch'
import Loader from 'components/UI/Loader/Loader'
import Disabled from 'components/UI/Disabled/Disabled'
import Tooltip from 'components/UI/Tooltip/Tooltip'

import styles from './RewardInfo.module.scss'

const Sponsor = ({ uuid, patron }) => {
  const [currentData, setCurrentData] = useState({})
  const [autoSponsor, setAutoSponsor] = useState(false)
  const [busyAuto, setBusyAuto] = useState(false)
  const [notifyEmail, setEmail] = useState('')
  const [busyEmail, setBusyEmail] = useState(false)
  const [displayName, setName] = useState('')
  const [url, setUrl] = useState('')
  const [busyInfo, setBusyInfo] = useState(false)
  const { t } = useTranslation(['common', 'account'])

  useEffect(() => {
    setAutoSponsor(patron['auto_sponsor'] || false)
    setEmail(patron['notify_email'] || '')
    setName((patron['display_name'] || patron['name']).trim())
    setUrl(patron['url'] || '')
    setCurrentData({
      auto_sponsor: patron['auto_sponsor'] || false,
      notify_email: patron['notify_email'] || '',
      display_name: (patron['display_name'] || patron['name']).trim(),
      url: patron['url'] || '',
    })
  }, [])

  const preventDefault = (event) => {
    event.preventDefault()
  }

  const toggleAutoSponsor = () => {
    setBusyAuto(true)
    setPatronInfo(uuid, { auto_sponsor: !autoSponsor }).then((resdata) => {
      setBusyAuto(false)
      if (resdata['error']) {
        console.error(resdata)
      }
    })
    setAutoSponsor(!autoSponsor)
  }

  const updateEmail = (event) => {
    setEmail(event.target.value)
  }
  const doUpdateEmail = (_) => {
    setBusyEmail(true)
    setPatronInfo(uuid, { notify_email: notifyEmail.trim() || null }).then((resdata) => {
      setBusyEmail(false)
      setCurrentData({ ...currentData, notify_email: notifyEmail.trim() || '' })
      if (resdata['error']) {
        console.error(resdata)
      }
    })
  }

  const updateName = (event) => {
    setName(event.target.value)
  }
  const updateUrl = (event) => {
    setUrl(event.target.value)
  }
  const doUpdateInfo = (_) => {
    setBusyInfo(true)
    setPatronInfo(uuid, { display_name: displayName.trim() || null, url: url.trim() || null }).then((resdata) => {
      setBusyInfo(false)
      setCurrentData({ ...currentData, display_name: displayName.trim() || '', url: url.trim() || '' })
      if (resdata['error']) {
        console.error(resdata)
      }
    })
  }

  return (
    <div>
      <h1>{t('account:rewards.sponsor.title')}</h1>

      <div className={styles.row}>
        <p>{t('common:display-name')}:</p>
        <form onSubmit={preventDefault}>
          <input type="text" value={displayName} data-tip={t('common:required')} onChange={updateName} />
        </form>
        <p>Link:</p>
        <form onSubmit={preventDefault}>
          <input type="text" value={url} data-tip={t('common:optional')} onChange={updateUrl} />
        </form>
        <Disabled
          disabled={(!isURL(url, { require_protocol: true }) && url.length) || !displayName.length}
          tooltip={t('common:invalid-name-url')}
        >
          <div
            className={`${styles.iconBtn} ${
              (displayName !== currentData['display_name'] || url !== currentData['url']) && styles.highlight
            }`}
            onClick={doUpdateInfo}
          >
            {busyInfo ? (
              <Loader />
            ) : displayName !== currentData['display_name'] || url !== currentData['url'] ? (
              <MdSave />
            ) : (
              <MdCheck />
            )}
          </div>
        </Disabled>
      </div>

      <p>{t('account:rewards.sponsor.p1')}</p>
      <p>
        <Trans
          i18nKey="account:rewards.sponsor.p2"
          t={t}
          components={{
            ticket: <IoTicket />,
            b: <strong />,
          }}
        />
      </p>
      <p>{t('account:rewards.sponsor.p3')}</p>
      <ol>
        <li>
          <Trans i18nKey="account:rewards.sponsor.p3li1" t={t} components={{ ticket: <IoTicket /> }} />
        </li>
        <li>{t('account:rewards.sponsor.p3li2')}</li>
      </ol>
      <p>{t('account:rewards.sponsor.p4')}</p>
      <p>{t('account:rewards.sponsor.p5')}</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <p>{t('account:rewards.sponsor.p6')}</p>
        <Switch on={autoSponsor} onClick={toggleAutoSponsor} />
        {busyAuto && <Loader />}
      </div>
      {autoSponsor && (
        <>
          <p>{t('account:rewards.sponsor.p7')}</p>

          <p>{t('account:rewards.sponsor.p8')}</p>

          <div className={styles.row}>
            <p>{t('common:email-address')}:</p>
            <form onSubmit={preventDefault}>
              <input type="text" value={notifyEmail} onChange={updateEmail} />
            </form>
            <Disabled disabled={!isEmail(notifyEmail) && notifyEmail.length} tooltip={t('common:invalid-email')}>
              <div
                className={`${styles.iconBtn} ${notifyEmail !== currentData['notify_email'] && styles.highlight}`}
                onClick={doUpdateEmail}
              >
                {busyEmail ? <Loader /> : notifyEmail !== currentData['notify_email'] ? <MdSave /> : <MdCheck />}
              </div>
            </Disabled>
          </div>

          <p>{t('account:rewards.sponsor.p9')}</p>
        </>
      )}

      <Tooltip />
    </div>
  )
}

export default Sponsor
