import { useTranslation } from 'next-i18next';
import Link from 'next/link';

import { MdLink } from 'react-icons/md'
import { MdMail } from 'react-icons/md'
import Heart from 'components/Heart/Heart'

import Avatar from 'components/Avatar/Avatar'

import apiSWR from 'utils/apiSWR'
import { titleCase } from 'utils/stringUtils';

import styles from './AuthorCredit.module.scss'

const AuthorCredit = ({ id, size, credit }) => {
  const { t } = useTranslation('asset');
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

  const assetLink = `/all?a=${id}`

  let creditStr = ""
  if (credit) {
    creditStr = t(`credits.${credit.trim().toLowerCase()}`)
    if (creditStr.startsWith('credits.')) {
      creditStr = creditStr.substring(8)
    }
    creditStr = titleCase(creditStr)
  }

  return (
    <div className={styles.author}>
      <Link href={assetLink} prefetch={false}>
        <a className={styles.avatar}>
          <Avatar id={id} size={50} />
          {data && data.regular_donor ?
            <div className={styles.regularDonor} data-tip="Regular asset donor"><Heart color="#F96854" /></div>
            : null}
        </a>
      </Link>
      <div className={styles.name}>
        <Link href={assetLink} prefetch={false}>
          <a><strong>{id}</strong></a>
        </Link>
        {credit ? <span className={styles.credit}>{creditStr}</span> : ""}
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
