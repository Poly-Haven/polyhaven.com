import { useState, useEffect } from 'react'
import { useTranslation, Trans } from 'next-i18next'
import { setPatronInfo } from 'utils/patronInfo'

import { MdCheck, MdVisibility, MdVisibilityOff } from 'react-icons/md'

import Disabled from 'components/UI/Disabled/Disabled'
import Switch from 'components/UI/Switch/Switch'

import styles from './RewardInfo.module.scss'

const Other = ({ uuid, patron }) => {
  const [currentData, setCurrentData] = useState({})
  const [anon, setAnon] = useState(false)
  const [name, setName] = useState('')
  const { t } = useTranslation(['common', 'account'])

  useEffect(() => {
    setAnon(patron.anon || false)
    setName((patron['display_name'] || patron['name']).trim())
    setCurrentData({
      name: (patron['display_name'] || patron['name']).trim(),
    })
  }, [])

  const preventDefault = (event) => {
    event.preventDefault()
  }

  const toggleAnon = () => {
    setPatronInfo(uuid, { anon: !anon }).then((resdata) => {
      if (resdata['error']) {
        console.error(resdata)
      }
    })
    setAnon(!anon)
  }

  const updateName = (event) => {
    setName(event.target.value)
  }
  const doUpdateName = (_) => {
    setPatronInfo(uuid, { display_name: name.trim() || null }).then((resdata) => {
      if (resdata['error']) {
        console.error(resdata)
      } else {
        setCurrentData({ ...currentData, name: name.trim() || '' })
      }
    })
  }

  return (
    <div>
      <h1>{t('account:rewards.credit.title')}</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        <p>{t('account:rewards.credit.p1')} </p>
        <Switch on={anon} onClick={toggleAnon} labelOff={<MdVisibility />} labelOn={<MdVisibilityOff />} />
        <p>
          <strong>{anon ? t('common:hidden').toLowerCase() : t('common:visible').toLowerCase()}</strong>
          <Trans i18nKey="account:rewards.credit.p2" t={t} values={{ hidden: '' }} />
        </p>
      </div>
      <p>{t('account:rewards.credit.p3')}</p>

      {!anon &&
        !patron.rewards.includes('Sponsor') && ( // Don't need to edit name if it's not shown or can be edited further above.
          <div className={styles.row}>
            <p>{t('common:display-name')}:</p>
            <form onSubmit={preventDefault}>
              <input type="text" value={name} onChange={updateName} />
            </form>
            <Disabled disabled={!name.length} tooltip={t('account:rewards.credit.invalid')}>
              <div
                className={`${styles.iconBtn} ${name !== currentData['name'] && styles.highlight}`}
                onClick={doUpdateName}
              >
                <MdCheck />
              </div>
            </Disabled>
          </div>
        )}
    </div>
  )
}

export default Other
