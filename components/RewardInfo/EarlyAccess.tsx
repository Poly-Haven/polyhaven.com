import { useTranslation, Trans } from 'next-i18next'

import IconPatreon from 'components/UI/Icons/Patreon'
import LinkText from 'components/LinkText/LinkText'

import styles from 'components/Library/Grid/GridItem/GridItem.module.scss'

const EarlyAccess = () => {
  const { t } = useTranslation(['common', 'account'])

  return (
    <div>
      <h1>{t('account:rewards.early-access.title')}</h1>
      <p>
        <Trans i18nKey="account:rewards.early-access.p1" t={t} components={{ lnk: <LinkText href="/all" /> }} />
      </p>
      <p>
        {t('account:rewards.early-access.p2')}{' '}
        <span style={{ display: 'inline-block' }}>
          <span className={`${styles.badgeSample} ${styles.soon}`}>
            <IconPatreon />
          </span>
        </span>
      </p>
      <p>{t('account:rewards.early-access.p3')}</p>
    </div>
  )
}

export default EarlyAccess
