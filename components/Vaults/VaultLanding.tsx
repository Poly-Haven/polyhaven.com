import { useState, useEffect } from 'react'
import apiSWR from 'utils/apiSWR'

import VaultBanner from './VaultBanner'
import DonationBox from 'components/DonationBox/DonationBox'
import HeartLock from 'components/UI/Icons/HeartLock'
import Roadmap from 'components/Roadmap/Roadmap'

import styles from './Vaults.module.scss'

const VaultLanding = ({ vaults }) => {
  const [numPatrons, setNumPatrons] = useState(0)
  const { data, error } = apiSWR('/milestones', { revalidateOnFocus: true })

  useEffect(() => {
    if (data && !error) {
      setNumPatrons(data.numPatrons)
    }
  }, [data, error])

  let numAssets = 0
  for (const vaultId in vaults) {
    numAssets += vaults[vaultId].assets.length
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>
          <HeartLock />
          Poly Haven Vaults
        </h1>
        <p>
          <strong>Donate to support the future of free assets and unlock The Vaults.</strong>
          <br />
          Available in Early Access to Patreon supporters, released freely when their goal is met.
        </p>
      </div>

      <div className={styles.vaultsList}>
        {Object.keys(vaults).map((vaultId) => (
          <VaultBanner key={vaultId} vault={vaults[vaultId]} numPatrons={numPatrons} />
        ))}
      </div>

      <div className={styles.textSection} style={{ maxWidth: '1200px' }}>
        <div className={styles.row}>
          <div>
            <h1>How it Works:</h1>
            <p>
              Poly Haven creates free and public domain 3D assets, but to fund our work we have locked away some of our
              content behind a temporary paywall: The Vaults.
            </p>
            <p>
              Each vault has a specific funding goal, defined by a target number of{' '}
              <a href="https://www.patreon.com/polyhaven">Patreon</a> members. Once this goal is reached, the vault is
              released freely for everyone.
            </p>
            <p>Until then, support us on Patreon to access the content inside all the vaults.</p>
            <p>
              Not only do you get immediate access to all {numAssets} vaulted assets, but you also help bring those
              assets freely to everyone in the future.
            </p>
          </div>

          <div>
            <h2 style={{ textAlign: 'center' }}>
              Donate $3+ per month to unlock {numAssets} assets and support our work.
            </h2>
            <DonationBox />
          </div>
        </div>
      </div>

      <Roadmap vaults />

      <div className={styles.textSection} style={{ marginBottom: '5em' }}>
        <h1>FAQ</h1>
        <h2>What is a Vault?</h2>
        <p>
          A vault is a collection of assets that are temporarily locked away until we reach a funding goal. Once the
          goal is reached, the vault is released freely for everyone.
        </p>
        <hr />

        <h2>How do I access the Vaults?</h2>
        <p>
          To access the vaults, you need to support us on Patreon with at least $3 per month. Once you become a patron,
          you will receive access to all the assets inside the vaults. Simply <a href="/account">log in</a> with your
          Patreon account, and the assets will become accessible to you.
        </p>
        <hr />

        <h2>Why are the Vaults locked?</h2>
        <p>
          The vaults are locked to help fund our work. Poly Haven is a small team of artists and developers who create
          free and public domain 3D assets. We rely on the support of our patrons to keep creating new content.
        </p>
        <p>
          We do not want to lock away our content, but we need to fund our work. The vaults are a temporary solution to
          help us reach our funding goals and provide free content to everyone.
        </p>
        <hr />

        <h2>What happens when a Vault is released?</h2>
        <p>
          When a vault is released, all the assets inside the vault are made freely available to everyone. This means
          that anyone can download and use the assets without any restrictions.
        </p>
        <p>Once a vault is released, it will remain free and public domain forever.</p>
        <p>
          We will anounce the release on Patreon, as well as social media. The vault page will be removed, and the
          assets will become available for free download.
        </p>
        <hr />

        <h2>What if we don't reach the funding goals?</h2>
        <p>
          The vaults will remain locked until the target number of patrons is reached. If a vault remains locked for a
          very long time, we will evaluate the situation and consider alternative ways to release the assets. Our goal
          is to make all assets freely available eventually, but we rely on the support of our community to make this
          possible. Your contributions help us continue creating high-quality, free content for everyone.
        </p>
      </div>
    </div>
  )
}

export default VaultLanding
