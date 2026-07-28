import { useTranslation, Trans } from 'next-i18next'

import { MdRocketLaunch } from 'react-icons/md'

import Button from 'components/UI/Button/Button'
import LinkText from 'components/LinkText/LinkText'

// Deliberately generic: it points at /learn rather than any one course, so adding a
// second course needs no change here.
const CourseAccess = () => {
  const { t } = useTranslation(['common', 'account'])

  return (
    <div>
      <h1>{t('account:rewards.course-access.title')}</h1>
      <p>
        <Trans i18nKey="account:rewards.course-access.p1" t={t} components={{ lnk: <LinkText href="/learn" /> }} />
      </p>
      <p>{t('account:rewards.course-access.p2')}</p>
      <Button text={t('account:rewards.course-access.cta')} href="/learn" icon={<MdRocketLaunch />} />
    </div>
  )
}

export default CourseAccess
