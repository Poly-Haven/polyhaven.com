import { useState } from 'react'
import { useTranslation, Trans } from 'next-i18next'
import Link from 'next/link'

import Button from 'components/UI/Button/Button'
import Heart from 'components/UI/Icons/Heart'
import Blender from 'components/UI/Icons/Blender'
import Disabled from 'components/UI/Disabled/Disabled'

import { TbCalendarSearch, TbCloudDown, TbSchool } from 'react-icons/tb'
import { IoLockOpen } from 'react-icons/io5'

import styles from './DonationBox.module.scss'
import btnStyles from 'components/UI/Button/Button.module.scss'

// rid = the tier's id in constants/patreon_tiers.json.
const tiers = {
  3: 'https://www.patreon.com/checkout/polyhaven?rid=6545091&cadence=12',
  5: 'https://www.patreon.com/checkout/polyhaven?rid=6545111&cadence=12',
  7: 'https://www.patreon.com/checkout/polyhaven?rid=29202719&cadence=12',
}

const oneTimeTiers = [25, 50, 100]

// Estimated cost of a one-time donation reaching us. PayPal's rate is for our South African account
// receiving from abroad (paypal.com/za/webapps/mpp/merchant-fees, updated 2026-09-28), then what's
// left is converted to ZAR and withdrawn to FNB.
const paypalPercent = 4.4
const paypalFixed = 0.3
const exchangePercent = 3
const withdrawalPercent = 1.5

const feePercent = (amount: number) => {
  const received =
    (amount * (1 - paypalPercent / 100) - paypalFixed) * (1 - exchangePercent / 100) * (1 - withdrawalPercent / 100)
  return Math.min(100, Math.round((1 - received / amount) * 100))
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
  const [oneTimeDonation, setOneTimeDonation] = useState(false)
  const [oneTimeAmount, setOneTimeAmount] = useState(50)

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
      // New key rather than reusing b6: that key's translations all say "sponsor an
      // asset", so reusing it would show stale text in every non-English locale.
      // Untranslated locales fall back to English instead.
      text: (
        <span>
          <Trans i18nKey="common:donation-box.b6-course" t={t} components={{ lnk: <Link href={`/learn`} /> }} />
        </span>
      ),
      icon: <TbSchool />,
      cost: 7,
    },
  ]

  const removeButtonMargin = { marginLeft: 0, marginRight: 0 }

  return (
    <div className={styles.wrapper}>
      <h3>{t('common:support-polyhaven')}</h3>
      <div className={styles.tiers}>
        {oneTimeDonation
          ? oneTimeTiers.map((amount) => (
              <div
                key={amount}
                onClick={() => setOneTimeAmount(Number(amount))}
                className={`${btnStyles.button} ${btnStyles[oneTimeAmount === Number(amount) ? 'red' : 'hollowRed']}`}
              >
                <div className={btnStyles.inner}>${amount}</div>
              </div>
            ))
          : Object.keys(tiers).map((cost) => (
              <div
                key={cost}
                onClick={() => setSelectedTier(Number(cost))}
                className={`${btnStyles.button} ${btnStyles[selectedTier === Number(cost) ? 'red' : 'hollowRed']}`}
              >
                <div className={btnStyles.inner}>${cost}</div>
              </div>
            ))}
      </div>
      {oneTimeDonation ? (
        <div style={{ fontSize: '0.93em' }}>
          <p>{t('common:donation-box.one-time-benefits-p1')}</p>
          <p>{t('common:donation-box.one-time-benefits-p2')}</p>
        </div>
      ) : (
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
      )}
      {oneTimeDonation ? (
        <div className={styles.inputRow}>
          <div className={styles.inputContainer}>
            <span className={styles.dollarSign}>$</span>
            <input type="number" value={oneTimeAmount} onChange={(e) => setOneTimeAmount(Number(e.target.value))} />
          </div>
          <Disabled disabled={oneTimeAmount <= 1}>
            <Button
              text={t('common:donation-box.donate-once')}
              href={oneTimeAmount > 1 ? `https://paypal.me/polyhaven/${oneTimeAmount}` : null}
              color="red"
              icon={<Heart />}
              style={removeButtonMargin}
            />
          </Disabled>
          <div
            onClick={() => setOneTimeDonation(!oneTimeDonation)}
            className={`${btnStyles.button} ${btnStyles.hollowRed} ${styles.removeButtonMargin} ${styles.btnSmall}`}
          >
            <div className={btnStyles.inner}>{t('common:donation-box.monthly')}</div>
          </div>
        </div>
      ) : (
        <div className={styles.inputRow}>
          <Button
            text={t('common:donation-box.donate-monthly')}
            href={tiers[selectedTier]}
            color="red"
            icon={<Heart />}
            style={removeButtonMargin}
          />
          <div
            onClick={() => setOneTimeDonation(!oneTimeDonation)}
            className={`${btnStyles.button} ${btnStyles.hollowRed} ${styles.removeButtonMargin} ${styles.btnSmall}`}
          >
            <div className={btnStyles.inner}>{t('common:donation-box.once')}</div>
          </div>
        </div>
      )}
      {oneTimeDonation && oneTimeAmount > 0 && oneTimeAmount <= 5 && (
        <div className={styles.feeWarning}>
          ⚠️{' '}
          <Trans
            i18nKey="common:donation-box.fee-warning"
            t={t}
            values={{ percent: feePercent(oneTimeAmount) }}
            components={{
              // No title attribute: it would show the browser's own tooltip on top of this one.
              tip: (
                <abbr
                  data-tip={t('common:donation-box.fee-warning-tip', {
                    paypalPercent,
                    paypalFixed: paypalFixed.toFixed(2),
                    exchangePercent,
                    withdrawalPercent,
                  })}
                />
              ),
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DonationBox
