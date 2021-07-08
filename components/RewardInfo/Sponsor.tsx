import { useState, useEffect } from "react"
import { isEmail, isURL } from 'validator';
import { setPatronInfo } from 'utils/patronInfo';

import { IoTicket } from 'react-icons/io5'
import { MdCheck } from "react-icons/md";

import Switch from "components/UI/Switch/Switch"
import Loader from "components/UI/Loader/Loader"
import Disabled from "components/UI/Disabled/Disabled";
import Tooltip from "components/Tooltip/Tooltip";

import styles from './RewardInfo.module.scss'

const Sponsor = ({ uuid, patron }) => {
  const [currentData, setCurrentData] = useState({});
  const [autoSponsor, setAutoSponsor] = useState(false);
  const [busyAuto, setBusyAuto] = useState(false);
  const [email, setEmail] = useState("");
  const [busyEmail, setBusyEmail] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [busyInfo, setBusyInfo] = useState(false);

  useEffect(() => {
    setAutoSponsor(patron['auto_sponsor'] || false)
    setEmail(patron['email'] || "")
    setName((patron['display_name'] || patron['name']).trim())
    setUrl(patron['url'] || "")
    setCurrentData({
      auto_sponsor: patron['auto_sponsor'] || false,
      email: patron['email'] || "",
      name: (patron['display_name'] || patron['name']).trim(),
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
    setPatronInfo(uuid, { notify_email: email.trim() || null })
      .then(resdata => {
        setBusyEmail(false)
        setCurrentData({ ...currentData, email: email.trim() || "" })
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
    setPatronInfo(uuid, { display_name: name.trim() || null, url: url.trim() || null })
      .then(resdata => {
        setBusyInfo(false)
        setCurrentData({ ...currentData, name: name.trim() || "", url: url.trim() || "" })
        if (resdata['error']) {
          console.error(resdata)
        }
      })
  }

  return (
    <div>
      <h1>Sponsor</h1>
      <p>You get to pick an asset every month to stick your name and a link next to permanently. To do this, we work with a system of "tokens".</p>
      <p>On the 5th of each month, after your payment is processed by Patreon, you receive one <IoTicket /> <strong>Sponsor Token</strong>.</p>
      <p>There are two ways to spend this token:</p>
      <ol>
        <li>By visiting the page of the asset you want to sponsor, and clicking the "<IoTicket /> Sponsor this asset" button on the right side of the page.</li>
        <li>Or you can turn on automatic sponsorships below, which will pick a random asset for you each month.</li>
      </ol>
      <p>Once a token is spent, it cannot be revoked or moved to a different asset.</p>

      <hr />

      <div style={{ display: "flex", alignItems: 'center', gap: "0.5em" }}>
        <p>Auto-sponsor a random asset each month:</p>
        <Switch
          on={autoSponsor}
          onClick={toggleAutoSponsor}
        />
        {busyAuto && <Loader />}
      </div>
      {autoSponsor && <p>On the 10th day of each month, any available tokens you have will be spent on random assets. This gives you 5 days (from the 5th to the 10th) to still manually spend your tokens.</p>}

      <hr />

      <p>When you sponsor an asset, the following info will be shown:</p>

      <div className={styles.row}>
        <p>Display name:</p>
        <form onSubmit={preventDefault}>
          <input
            type="text"
            value={name}
            onChange={updateName} />
        </form>
        <p>Link:</p>
        <form onSubmit={preventDefault}>
          <input
            type="text"
            value={url}
            onChange={updateUrl} />
        </form>
        <Disabled disabled={(!isURL(url, { require_protocol: true }) && url.length) || !name.length} tooltip="Invalid name or url">
          <div className={`${styles.iconBtn} ${(name !== currentData['name'] || url !== currentData['url']) && styles.highlight}`} onClick={doUpdateInfo}>{busyInfo ? <Loader /> : <MdCheck />}</div>
        </Disabled>
      </div>

      <hr />

      <p>If you want to be notified when you receive a new token, or when an asset is automatically picked for you, please enter your email address below:</p>

      <div className={styles.row}><p>Email address:</p>
        <form onSubmit={preventDefault}>
          <input
            type="text"
            value={email}
            onChange={updateEmail} />
        </form>
        <Disabled disabled={!isEmail(email) && email.length} tooltip="Invalid email address">
          <div className={`${styles.iconBtn} ${email !== currentData['email'] && styles.highlight}`} onClick={doUpdateEmail}>{busyEmail ? <Loader /> : <MdCheck />}</div>
        </Disabled>
      </div>

      <p>To unsubscribe from notifications, clear your email address above and click the tick button.</p>

      <Tooltip />
    </div>
  )
}

export default Sponsor
