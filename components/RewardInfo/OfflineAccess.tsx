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
import CopyCode from 'components/UI/CopyCode/CopyCode'

import styles from './RewardInfo.module.scss'
import btnStyles from 'components/UI/Button/Button.module.scss'

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
      {/* TODO localize */}
      <p>To download our Blender add-on, simply follow these steps:</p>
      {patron.access_token ? (
        <p>
          <strong>Step 1:</strong> <s>Create your access token:</s> ✅
        </p>
      ) : (
        <div className={styles.row}>
          <p>
            <strong>Step 1:</strong> Create your access token:
          </p>
          <div className={`${btnStyles.button} ${btnStyles.accent}`}>
            <div className={btnStyles.inner}>Create Access Token</div>
          </div>
        </div>
      )}
      <p>
        <strong>Step 2:</strong> In your Blender Preferences, add our Extension Repository and paste your access token.
      </p>
      {patron.access_token && (
        <>
          <p>
            Extension Repository URL: <CopyCode text="https://api.polyhaven.com/v2/extensions" />
          </p>
          <p>
            Your Authentication Access Token: <CopyCode display="Copy" text={patron.access_token} />
          </p>
        </>
      )}

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
