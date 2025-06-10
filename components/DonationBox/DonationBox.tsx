import { useState } from 'react'
import { useTranslation, Trans } from 'next-i18next'
import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'
import Blender from 'components/UI/Icons/Blender'

import { TbCalendarSearch, TbCloudDown } from 'react-icons/tb'
import { IoTicket, IoLockOpen } from 'react-icons/io5'

import styles from './DonationBox.module.scss'
import btnStyles from 'components/UI/Button/Button.module.scss'

const tiers = {
  3: 'https://www.patreon.com/checkout/polyhaven?rid=6545091',
  5: 'https://www.patreon.com/checkout/polyhaven?rid=6545111',
  10: 'https://www.patreon.com/checkout/polyhaven?rid=2011184',
}

const Benefit = ({ text, icon, bold, excluded, cost }) => {
  return (
    <div
      className={`${styles.benefit} ${excluded ? styles.excluded : ''} ${bold ? styles.bold : ''}`}
      title={excluded ? `Requires $${cost} donation` : ''}
    >
      {icon} {text}
    </div>
  )
}

const DonationBox = () => {
  const { t } = useTranslation('common')
  const [selectedTier, setSelectedTier] = useState(5)

  const benefits = [
    {
      text: (
        <span>
          <Trans i18nKey="common:donation-box.b1" t={t} components={{ lnk: <Link href={`/all`} /> }} />
        </span>
      ),
      icon: <Heart />,
      cost: 1,
    },
    {
      text: (
        <span>
          <Trans
            i18nKey="common:donation-box.b2"
            t={t}
            components={{ lnk: <Link href={`https://www.patreon.com/posts/how-to-get-early-14640360`} /> }}
          />
        </span>
      ),
      icon: <TbCalendarSearch />,
      cost: 3,
    },
    {
      text: (
        <span>
          <Trans i18nKey="common:donation-box.b3" t={t} components={{ lnk: <Link href={`/vaults`} /> }} />
        </span>
      ),
      icon: <IoLockOpen />,
      cost: 3,
    },
    {
      text: (
        <span>
          <Trans i18nKey="common:donation-box.b4" t={t} components={{ lnk: <Link href={`/plugins/blender`} /> }} />
        </span>
      ),
      icon: <Blender />,
      cost: 5,
    },
    {
      text: (
        <span>
          <Trans
            i18nKey="common:donation-box.b5"
            t={t}
            components={{ lnk: <Link href={`https://www.patreon.com/posts/14640286`} /> }}
          />
        </span>
      ),
      icon: <TbCloudDown />,
      cost: 5,
    },
    {
      text: (
        <span>
          <Trans
            i18nKey="common:donation-box.b6"
            t={t}
            components={{ lnk: <Link href={`https://www.patreon.com/posts/53488947`} /> }}
          />
        </span>
      ),
      icon: <IoTicket />,
      cost: 10,
    },
  ]

  return (
    <div className={styles.wrapper}>
      <h3>{t('common:support-polyhaven')}</h3>
      <div className={styles.tiers}>
        {Object.keys(tiers).map((cost) => (
          <div
            key={cost}
            onClick={() => setSelectedTier(Number(cost))}
            className={`${btnStyles.button} ${btnStyles[selectedTier === Number(cost) ? 'red' : 'hollowRed']}`}
          >
            <div className={btnStyles.inner}>${cost}</div>
          </div>
        ))}
      </div>
      <div className={styles.benefits}>
        {benefits.map((benefit, i) => (
          <Benefit
            key={i}
            text={benefit.text}
            icon={benefit.icon}
            bold={selectedTier === benefit.cost}
            excluded={selectedTier < benefit.cost}
            cost={benefit.cost}
          />
        ))}
      </div>
      <Button text="Donate monthly" href={tiers[selectedTier]} color="red" icon={<Heart />} />
    </div>
  )
}

export default DonationBox
