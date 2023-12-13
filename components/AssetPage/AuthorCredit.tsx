import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import { MdLink } from 'react-icons/md'
import { MdMail } from 'react-icons/md'
import Heart from 'components/UI/Icons/Heart'

const Avatar = dynamic(() => import('components/UI/Avatar/Avatar'), { ssr: false })

import apiSWR from 'utils/apiSWR'
import { decrypt } from 'utils/insecureStringEncryption'
import { titleCase } from 'utils/stringUtils'

import styles from './AuthorCredit.module.scss'

const AuthorCredit = ({ id, size, credit }) => {
  const { t } = useTranslation('asset')
  const [popup, setPopup] = useState(false)

  let name = id
  let link = '/'
  let encryptedEmail = {}
  let donate = ''

  const { data, error } = apiSWR(`/author/${id}`, { revalidateOnFocus: false })
  if (error) {
    link = null
  } else if (data) {
    name = data.name
    link = data.link
    donate = data.donate
    encryptedEmail = data.encrypted_email
  }

  if (donate && donate.startsWith('paypal:')) {
    const paypalEmailToLink = (email, description) =>
      `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${email}&item_name=${description}`
    donate = paypalEmailToLink(donate.slice('paypal:'.length), 'Poly Haven: ' + name)
  }

  const assetLink = `/all?a=${id}`

  let creditStr = ''
  if (credit) {
    creditStr = t(`credits.${credit.trim().toLowerCase()}`)
    if (creditStr.startsWith('credits.')) {
      creditStr = creditStr.substring(8)
    }
    creditStr = titleCase(creditStr)
  }

  const emailClick = () => {
    navigator.clipboard.writeText(decrypt(encryptedEmail))
    setPopup(true)

    setTimeout(() => {
      setPopup(false)
    }, 3000)
  }

  return (
    <div className={styles.author}>
      <Link href={assetLink} prefetch={false} className={styles.avatar}>
        <Avatar id={id} size={50} />
        {data && data.regular_donor ? (
          <div className={styles.regularDonor} data-tip="Regular asset donor">
            <Heart color="#F96854" />
          </div>
        ) : null}
      </Link>
      <div className={styles.name}>
        <Link href={assetLink} prefetch={false}>
          <strong>{id}</strong>
        </Link>
        {credit ? <span className={styles.credit}>{creditStr}</span> : ''}
        <div className={styles.links}>
          {link ? (
            <a href={link} target="_blank" rel="noopener">
              <MdLink />
            </a>
          ) : (
            ''
          )}
          {encryptedEmail ? (
            <div className={styles.a} onClick={emailClick}>
              <MdMail />
              <div className={`${styles.popup} ${!popup ? styles.hide : ''}`}>Copied email to clipboard!</div>
            </div>
          ) : (
            ''
          )}
          {donate ? (
            <a href={donate} target="_blank" rel="noopener">
              <Heart />
            </a>
          ) : (
            ''
          )}
        </div>
      </div>
    </div>
  )
}

AuthorCredit.defaultProps = {
  size: 'small',
  credit: '',
}

export default AuthorCredit
