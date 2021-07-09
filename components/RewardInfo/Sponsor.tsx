import { useState, useEffect } from "react"
import { isEmail, isURL } from 'validator';
import { setPatronInfo } from 'utils/patronInfo';

import { IoTicket } from 'react-icons/io5'
import { MdCheck, MdSave } from "react-icons/md";

import Switch from "components/UI/Switch/Switch"
import Loader from "components/UI/Loader/Loader"
import Disabled from "components/UI/Disabled/Disabled";
import Tooltip from "components/Tooltip/Tooltip";

import styles from './RewardInfo.module.scss'

const Sponsor = ({ uuid, patron }) => {
  const [currentData, setCurrentData] = useState({});
  const [autoSponsor, setAutoSponsor] = useState(false);
  const [busyAuto, setBusyAuto] = useState(false);
  const [notifyEmail, setEmail] = useState("");
  const [busyEmail, setBusyEmail] = useState(false);
  const [displayName, setName] = useState("");
  const [url, setUrl] = useState("");
  const [busyInfo, setBusyInfo] = useState(false);

  useEffect(() => {
    setAutoSponsor(patron['auto_sponsor'] || false)
    setEmail(patron['notify_email'] || "")
    setName((patron['display_name'] || patron['name']).trim())
    setUrl(patron['url'] || "")
    setCurrentData({
      auto_sponsor: patron['auto_sponsor'] || false,
      notify_email: patron['notify_email'] || "",
      display_name: (patron['display_name'] || patron['name']).trim(),
      url: patron['url'] || ""
    })
  }, []);

  const preventDefault = event => {
    event.preventDefault();
  }

  const toggleAutoSponsor = () => {
    setBusyAuto(true)
    setPatronInfo(uuid, { auto_sponsor: !autoSponsor })
      .then(resdata => {
        setBusyAuto(false)
        if (resdata['error']) {
          console.error(resdata)
        }
      })
    setAutoSponsor(!autoSponsor)
  }

  const updateEmail = event => {
    setEmail(event.target.value)
  }
  const doUpdateEmail = _ => {
    setBusyEmail(true)
    setPatronInfo(uuid, { notify_email: notifyEmail.trim() || null })
      .then(resdata => {
        setBusyEmail(false)
        setCurrentData({ ...currentData, notify_email: notifyEmail.trim() || "" })
        if (resdata['error']) {
          console.error(resdata)
        }
      })
  }

  const updateName = event => {
    setName(event.target.value)
  }
  const updateUrl = event => {
    setUrl(event.target.value)
  }
  const doUpdateInfo = _ => {
    setBusyInfo(true)
    setPatronInfo(uuid, { display_name: displayName.trim() || null, url: url.trim() || null })
      .then(resdata => {
        setBusyInfo(false)
        setCurrentData({ ...currentData, display_name: displayName.trim() || "", url: url.trim() || "" })
        if (resdata['error']) {
          console.error(resdata)
        }
      })
  }

  return (
    <div>
      <h1>Sponsor</h1>

      <div className={styles.row}>
        <p>Display name:</p>
        <form onSubmit={preventDefault}>
          <input
            type="text"
            value={displayName}
            data-tip="Required"
            onChange={updateName} />
        </form>
        <p>Link:</p>
        <form onSubmit={preventDefault}>
          <input
            type="text"
            value={url}
            data-tip="Optional"
            onChange={updateUrl} />
        </form>
        <Disabled disabled={(!isURL(url, { require_protocol: true }) && url.length) || !displayName.length} tooltip="Invalid name or url">
          <div className={`${styles.iconBtn} ${(displayName !== currentData['display_name'] || url !== currentData['url']) && styles.highlight}`} onClick={doUpdateInfo}>{busyInfo ? <Loader /> : (displayName !== currentData['display_name'] || url !== currentData['url']) ? <MdSave /> : <MdCheck />}</div>
        </Disabled>
      </div>

      <p>You get to pick an asset every month to stick your name and a link next to permanently. To do this, we work with a system of "tokens".</p>
      <p>At the start of each month after your payment is processed by Patreon, you automatically receive one <IoTicket /> <strong>Sponsor Token</strong>.</p>
      <p>There are two ways to spend this token:</p>
      <ol>
        <li>By visiting the page of the asset you want to sponsor, and clicking the "<IoTicket /> Sponsor this asset" button on the right side of the page.</li>
        <li>Or you can turn on automatic sponsorships below, which will pick a random asset for you each month.</li>
      </ol>
      <p>Tokens do not expire, so you can come back after a few months and spend your accumulated tokens.</p>
      <p>Once a token is spent, it cannot be revoked or moved to a different asset.</p>

      <div style={{ display: "flex", alignItems: 'center', gap: "0.5em" }}>
        <p>Auto-sponsor a random asset each month:</p>
        <Switch
          on={autoSponsor}
          onClick={toggleAutoSponsor}
        />
        {busyAuto && <Loader />}
      </div>
      {autoSponsor && <>
        <p>On the 15th day of each month, any available tokens you have will be spent on random assets. This gives you 15 days to manually spend your tokens if you want to.</p>

        <p>If you want to be notified when an asset is automatically picked for you, please enter your email address below:</p>

        <div className={styles.row}><p>Email address:</p>
          <form onSubmit={preventDefault}>
            <input
              type="text"
              value={notifyEmail}
              onChange={updateEmail} />
          </form>
          <Disabled disabled={!isEmail(notifyEmail) && notifyEmail.length} tooltip="Invalid email address">
            <div className={`${styles.iconBtn} ${notifyEmail !== currentData['notify_email'] && styles.highlight}`} onClick={doUpdateEmail}>{busyEmail ? <Loader /> : (notifyEmail !== currentData['notify_email']) ? <MdSave /> : <MdCheck />}</div>
          </Disabled>
        </div>

        <p>To unsubscribe from notifications, clear your email address above and click the save button.</p>
      </>}

      <Tooltip />
    </div>
  )
}

export default Sponsor
