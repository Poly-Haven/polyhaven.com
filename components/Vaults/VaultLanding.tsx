import { useState, useEffect } from 'react'
import { useTranslation, Trans } from 'next-i18next'
import Link from 'next/link'
import apiSWR from 'utils/apiSWR'
import useQuery from 'hooks/useQuery'

import VaultBanner from './VaultBanner'
import DonationBox from 'components/DonationBox/DonationBox'
import HeartLock from 'components/UI/Icons/HeartLock'
import Roadmap from 'components/Roadmap/Roadmap'
import Button from 'components/UI/Button/Button'
import FaqItem from 'components/FaqPage/FaqItem'

import { IoMdUnlock } from 'react-icons/io'

import styles from './Vaults.module.scss'

const VaultLanding = ({ vaults }) => {
  const { t } = useTranslation(['common', 'vaults'])
  const [numPatrons, setNumPatrons] = useState(0)
  const { data, error } = apiSWR('/milestones', { revalidateOnFocus: true })

  useEffect(() => {
    if (data && !error) {
      setNumPatrons(data.numPatrons)
    }
  }, [data, error])

  const [clicked, setClicked] = useState('')
  const query = useQuery()
  useEffect(() => {
    if (query && query.q) {
      const qID = `${query.q}`
      setClicked(qID)

      const scrollToElement = () => {
        const element = document.querySelector(`#${qID}`)
        console.log('scrollToElement', element)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }

      // Use a timeout to ensure the DOM is fully rendered
      setTimeout(scrollToElement, 10)
    }
  }, [query])

  let numAssets = 0
  for (const vaultId in vaults) {
    numAssets += vaults[vaultId].assets.length
  }

  const nextVault = Object.values(vaults)[0]

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 dir="ltr">
          <HeartLock />
          Poly Haven Vaults
        </h1>
        <p>
          <strong>{t('vaults:tagline-1')}</strong>
          <br />
          {t('vaults:tagline-2')}
        </p>
      </div>

      <div className={styles.vaultsList}>
        {Object.keys(vaults).map((vaultId) => (
          <VaultBanner key={vaultId} vault={vaults[vaultId]} numPatrons={numPatrons} />
        ))}
      </div>

      <div className={styles.infoSection}>
        <div className={styles.row}>
          <FaqItem question={t('vaults:how-it-works')} qID="how-it-works" activeQ={clicked} main>
            <p>{t('vaults:how-it-works-p1')}</p>
            <p>
              <Trans
                i18nKey="vaults:how-it-works-p2"
                t={t}
                components={{ patreonLink: <a href="https://www.patreon.com/polyhaven" /> }}
              />
            </p>
            <p>
              <Trans
                i18nKey="vaults:how-it-works-p3"
                t={t}
                values={{
                  vaultName: nextVault['name'],
                  assetsCount: nextVault['assets'].length,
                  target: nextVault['target'],
                  remaining: nextVault['target'] - numPatrons,
                }}
                components={{ vaultLink: <Link href={`/vaults/${nextVault['id']}`} /> }}
              />
            </p>
            <p>
              <Trans i18nKey="vaults:how-it-works-p4" t={t} components={{ strong: <strong /> }} />
            </p>
            <p>
              <Trans
                i18nKey="vaults:how-it-works-p5"
                t={t}
                values={{ numAssets }}
                components={{ strong: <strong /> }}
              />
            </p>
            <p>
              <Trans
                i18nKey="vaults:how-it-works-p6"
                t={t}
                components={{ financeLink: <Link href="/finance-reports" /> }}
              />
            </p>
          </FaqItem>

          <div className={styles.donationBox}>
            <h2 style={{ textAlign: 'center' }}>
              <Trans
                i18nKey="vaults:donation-heading"
                t={t}
                values={{ numAssets }}
                components={{ span: <span className={styles.green} /> }}
              />
            </h2>
            <DonationBox />
          </div>
        </div>
      </div>

      <Roadmap vaults />

      <div className={styles.textSection} style={{ marginBottom: '5em' }}>
        <h1>{t('vaults:faq')}</h1>
        <FaqItem question={t('vaults:what-is-vault')} qID="what" activeQ={clicked}>
          <p>{t('vaults:what-is-vault-answer')}</p>
        </FaqItem>

        <FaqItem question={t('vaults:all-future-locked')} qID="future" activeQ={clicked}>
          <p>{t('vaults:all-future-locked-p1')}</p>
          <p>{t('vaults:all-future-locked-p2')}</p>
          <p>{t('vaults:all-future-locked-p3')}</p>
          <p>{t('vaults:all-future-locked-p4')}</p>
        </FaqItem>

        <FaqItem question={t('vaults:how-to-access')} qID="how" activeQ={clicked}>
          <p>
            <Trans
              i18nKey="vaults:how-to-access-p1"
              t={t}
              components={{ patreonLink: <a href="https://www.patreon.com/polyhaven" /> }}
            />
          </p>
          <p>
            <Trans i18nKey="vaults:how-to-access-p2" t={t} components={{ loginLink: <a href="/account" /> }} />
          </p>
          <p>
            <Trans
              i18nKey="vaults:how-to-access-p3"
              t={t}
              components={{ blenderLink: <Link href="/plugins/blender" /> }}
            />
          </p>
        </FaqItem>

        <FaqItem question={t('vaults:is-crowdfunding')} qID="crowdfunding" activeQ={clicked}>
          <p>{t('vaults:is-crowdfunding-p1')}</p>
          <p>{t('vaults:is-crowdfunding-p2')}</p>
          <p>{t('vaults:is-crowdfunding-p3')}</p>
        </FaqItem>

        <FaqItem question={t('vaults:what-happens-release')} qID="release" activeQ={clicked}>
          <p>{t('vaults:what-happens-release-p1')}</p>
          <p>{t('vaults:what-happens-release-p2')}</p>
          <p>{t('vaults:what-happens-release-p3')}</p>
          <p>
            <Trans
              i18nKey="vaults:what-happens-release-p4"
              t={t}
              components={{ collectionLink: <Link href="/collections" /> }}
            />
          </p>
        </FaqItem>

        <FaqItem question={t('vaults:what-if-no-goal')} qID="failure" activeQ={clicked}>
          <p>{t('vaults:what-if-no-goal-p1')}</p>
          <p>{t('vaults:what-if-no-goal-p2')}</p>
          <p>{t('vaults:what-if-no-goal-p3')}</p>
        </FaqItem>

        <FaqItem question={t('vaults:what-license')} qID="license" activeQ={clicked}>
          <p>
            <Trans i18nKey="vaults:what-license-answer" t={t} components={{ licenseLink: <Link href="/license" /> }} />
          </p>
        </FaqItem>

        <div className={styles.row}>
          <p>
            <Trans
              i18nKey="vaults:different-question"
              t={t}
              components={{ contactLink: <Link href="/about-contact" /> }}
            />
          </p>
          <div className={styles.spacer} />
          <Button
            text={t('vaults:access-vaults-now')}
            href="https://www.patreon.com/checkout/polyhaven"
            icon={<IoMdUnlock />}
            color="red"
          />
        </div>
      </div>
    </div>
  )
}

export default VaultLanding
