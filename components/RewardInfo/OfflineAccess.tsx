import { useState } from 'react'
import { sendNextcloudInvite } from 'utils/patronInfo'
import { isEmail } from 'validator'
import { useTranslation, Trans } from 'next-i18next'

import { MdSend, MdCheck } from 'react-icons/md'

import LinkText from 'components/LinkText/LinkText'
import Loader from 'components/UI/Loader/Loader'
import Disabled from 'components/UI/Disabled/Disabled'
import Tooltip from 'components/UI/Tooltip/Tooltip'
import Button from 'components/UI/Button/Button'

import styles from './RewardInfo.module.scss'

const OfflineAccess = ({ uuid, patron }) => {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { t } = useTranslation(['common', 'account'])

  const preventDefault = (event) => {
    event.preventDefault()
  }

  const updateEmail = (event) => {
    setEmail(event.target.value)
  }
  const doUpdateEmail = (_) => {
    setBusy(true)
    sendNextcloudInvite(uuid, email).then((resdata) => {
      setBusy(false)
      if (resdata['error']) {
        setError(resdata.message)
        console.error(resdata)
      } else if (resdata.ocs.meta.status !== 'ok') {
        setError(resdata.ocs.meta.message)
        console.error(resdata)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <div>
      <h1>Blender Add-on</h1>
      <p>Download our Blender add-on from the attachments at the bottom of this post on Patreon:</p>
      <Button text="Download Add-on" href="https://www.patreon.com/posts/70974704" />

      <h1>{t('account:rewards.offline-access.title')}</h1>

      {!patron.invite_sent ? (
        <div className={styles.row}>
          <p>{t('account:rewards.offline-access.p1')}</p>
          <form onSubmit={preventDefault}>
            <input type="text" value={email} onChange={updateEmail} />
          </form>
          {!success && (
            <Disabled disabled={busy} tooltip={t('common:please-wait')}>
              <Disabled disabled={!isEmail(email)} tooltip={t('common:invalid-email')}>
                <div className={`${styles.iconBtn} ${!success && styles.highlight}`} onClick={doUpdateEmail}>
                  {busy ? <Loader /> : success ? <MdCheck /> : <MdSend />}
                </div>
              </Disabled>
            </Disabled>
          )}
          {error && <p>{error}</p>}
          {success && <p>{t('account:rewards.offline-access.p2')}</p>}
        </div>
      ) : (
        <p>
          <em>
            <Trans
              i18nKey="account:rewards.offline-access.p3"
              t={t}
              components={{ lnk: <LinkText href="/about-contact" /> }}
            />
          </em>
        </p>
      )}

      <p>
        <Trans
          i18nKey="account:rewards.offline-access.p4"
          t={t}
          components={{ lnk: <a href="https://www.patreon.com/posts/accessing-14640286" /> }}
        />
      </p>
      <Tooltip />
    </div>
  )
}

export default OfflineAccess
