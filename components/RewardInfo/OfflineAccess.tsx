import { useState } from 'react';
import Link from 'next/link';
import { sendNextcloudInvite } from 'utils/patronInfo';
import { isEmail } from 'validator';

import { MdSend, MdCheck } from "react-icons/md";

import Loader from "components/UI/Loader/Loader"
import Disabled from "components/UI/Disabled/Disabled";
import Tooltip from "components/Tooltip/Tooltip";

import styles from './RewardInfo.module.scss'

const OfflineAccess = ({ uuid, patron }) => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const preventDefault = event => {
    event.preventDefault();
  }

  const updateEmail = event => {
    setEmail(event.target.value)
  }
  const doUpdateEmail = _ => {
    setBusy(true)
    sendNextcloudInvite(uuid, email)
      .then(resdata => {
        setBusy(false)
        if (resdata['error']) {
          setError(resdata.message)
          console.error(resdata)
        } else if (resdata.ocs.meta.status !== "ok") {
          setError(resdata.ocs.meta.message)
          console.error(resdata)
        } else {
          setSuccess(true)
        }
      })
  }

  return (
    <div>
      <h1>Offline Access</h1>

      {!patron.invite_sent ?
        <div className={styles.row}>
          <p>Enter your email address to send yourself an invite to our cloud folder:</p>
          <form onSubmit={preventDefault}>
            <input
              type="text"
              value={email}
              onChange={updateEmail} />
          </form>
          {!success &&
            <Disabled disabled={busy} tooltip="Please wait...">
              <Disabled disabled={!isEmail(email)} tooltip="Invalid email address">
                <div className={`${styles.iconBtn} ${!success && styles.highlight}`} onClick={doUpdateEmail}>{busy ? <Loader /> : (success ? <MdCheck /> : <MdSend />)}</div>
              </Disabled>
            </Disabled>
          }
          {error && <p>{error}</p>}
          {success && <p>Check your email :)</p>}
        </div>
        :
        <p><em>Invite successfully sent. If you have any trouble or need to change your account email, <Link href="/about-contact">please contact us</Link>.</em></p>
      }

      <p>See <Link href="https://www.patreon.com/posts/accessing-14640286">this post</Link> for further instructions on how to set up Nextcloud and start syncing assets to your computer.</p>
      <Tooltip />
    </div>
  )
}

export default OfflineAccess
