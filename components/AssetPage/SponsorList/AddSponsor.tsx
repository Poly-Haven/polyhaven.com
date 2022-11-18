import { useState } from 'react'
import { sponsorAsset } from 'utils/patronInfo'

import { IoTicket } from 'react-icons/io5'
import { MdCheck, MdClose } from "react-icons/md";

import Disabled from 'components/UI/Disabled/Disabled'

import styles from '../AssetPage.module.scss'

const AddSponsor = ({ assetID, patron }) => {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(0)
  const [message, setMessage] = useState("")

  const click = _ => {
    setLoading(true)
    sponsorAsset(patron.uid, assetID)
      .then(resdata => {
        setLoading(false)
        if (resdata['error']) {
          console.error(resdata)
          setComplete(-1)
        } else {
          setComplete(1)
        }
        setMessage(resdata.message)
      })
  }

  let numTokens = 0;
  if (patron.sponsor_tokens) {
    for (const v of Object.values(patron.sponsor_tokens)) {
      if (!v) numTokens++;
    }
  }

  if (numTokens === 0) {
    return null
  }

  return (
    <Disabled disabled={complete !== 0}>
      <Disabled disabled={loading} tooltip="Loading...">
        <Disabled disabled={numTokens === 0} tooltip="You have no tokens left. Check back again on the 5th of next month!">
          <div className={styles.addSponsor} onClick={click}>
            {complete === 0 ? <IoTicket /> : (complete > 0 ? <MdCheck /> : <MdClose />)}
            {message || <span>Sponsor this asset<br /><em>{numTokens} {numTokens > 1 ? "tokens" : "token"} left</em></span>}
          </div>
        </Disabled>
      </Disabled>
    </Disabled>
  )
}

export default AddSponsor
