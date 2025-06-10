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
  const [selectedTier, setSelectedTier] = useState(5)
  const { t } = useTranslation('asset')

  const benefits = [
    {
      text: (
        <span>
          Help us make <Link href="/all">free assets</Link> for everyone!
        </span>
      ),
      icon: <Heart />,
      cost: 1,
    },
    {
      text: (
        <span>
          <Link href="https://www.patreon.com/posts/how-to-get-early-14640360">Early access</Link> to upcoming assets.
        </span>
      ),
      icon: <TbCalendarSearch />,
      cost: 3,
    },
    {
      text: (
        <span>
          Instant access to all content in <Link href="/vaults">the Vaults</Link>.
        </span>
      ),
      icon: <IoLockOpen />,
      cost: 3,
    },
    {
      text: (
        <span>
          Our Blender asset browser <Link href="/plugins/blender">add-on</Link>.
        </span>
      ),
      icon: <Blender />,
      cost: 5,
    },
    {
      text: (
        <span>
          Bulk download & offline access with <Link href="https://www.patreon.com/posts/14640286">our cloud</Link>.
        </span>
      ),
      icon: <TbCloudDown />,
      cost: 5,
    },
    {
      text: (
        <span>
          <Link href="https://www.patreon.com/posts/53488947">Sponsor an asset</Link> with your name & link.
        </span>
      ),
      icon: <IoTicket />,
      cost: 10,
    },
  ]

  return (
    <div className={styles.wrapper}>
      <h3>Support Poly Haven!</h3>
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
