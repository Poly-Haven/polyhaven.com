import { MdLink } from 'react-icons/md'
import { MdMail } from 'react-icons/md'
import Heart from 'components/Heart/Heart'

import Avatar from 'components/Avatar/Avatar'

import apiSWR from 'utils/apiSWR'

import styles from './AuthorCredit.module.scss'

const AuthorCredit = ({ id, size, credit }) => {
  let name = id
  let link = "/"
  let email = ""
  let donate = ""

  const { data, error } = apiSWR(`/author/${id}`, { revalidateOnFocus: false });
  if (error) {
    link = null
  } else if (data) {
    name = data.name
    link = data.link
    email = data.email
    donate = data.donate
  }

  if (donate && donate.startsWith('paypal:')) {
    const paypalEmailToLink = (email, description) => `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${email}&item_name=${description}`;
    donate = paypalEmailToLink(donate.slice('paypal:'.length), "Poly Haven: " + name)
  }

  return (
    <div className={styles.author}>
      <div className={styles.avatar}>
        <Avatar id={id} size={50} />
      </div>
      <div className={styles.name}>
        <strong>{id}</strong>
        {credit ? <span className={styles.credit}>{credit}</span> : ""}
        <div className={styles.links}>
          {link ? <a href={link} target="_blank" rel="noopener"><MdLink /></a> : ""}
          {email ? <a href={`mailto:${email}`} target="_blank" rel="noopener"><MdMail /></a> : ""}
          {donate ? <a href={donate} target="_blank" rel="noopener"><Heart /></a> : ""}
        </div>
      </div>
    </div>
  )
}

AuthorCredit.defaultProps = {
  size: "small",
  credit: ""
}

export default AuthorCredit
