import { useTranslation, Trans } from 'next-i18next';

import LinkText from 'components/LinkText/LinkText';

const Stakeholder = () => {
  const { t } = useTranslation(['common', 'account']);

  return (
    <div>
      <h1>{t('account:rewards.stakeholder.title')}</h1>
      <p>{t('account:rewards.stakeholder.p1')}</p>
      <p><Trans
        i18nKey="account:rewards.stakeholder.p2"
        t={t}
        components={{ lnk: <LinkText href="/about-contact" /> }}
      /></p>
    </div>
  )
}

export default Stakeholder
