import { useState, useEffect } from 'react'
import Link from 'next/link'
import apiSWR from 'utils/apiSWR'

import Button from 'components/UI/Button/Button'
import DonationBox from 'components/DonationBox/DonationBox'
import Loader from 'components/UI/Loader/Loader'

import { IoMdUnlock } from 'react-icons/io'
import { MdArrowForward } from 'react-icons/md'

import styles from './Vaults.module.scss'

const Vault = ({ vault, numPatrons }) => {
  const progressBarPosition = Math.min(1, numPatrons / vault.milestone.target)
  return (
    <div className={styles.vaultWrapper}>
      <div className={styles.vault}>
        <div className={styles.gradient} />
        <div className={styles.left}>
          <h2>{vault.name}</h2>
          <p>{vault.description}</p>
          {vault.about && <Button text="About the Project" href={vault.about} />}
        </div>

        <div className={styles.right}>
          <div className={styles.row}>
            <Button text="Browse Assets" href={`/vaults/${vault.id}`} />
            <Button
              text="Access Now"
              href="https://www.patreon.com/checkout/polyhaven"
              icon={<IoMdUnlock />}
              color="red"
            />
          </div>

          <div className={styles.barWrapper}>
            <div className={styles.barOuter}>
              <div className={styles.barInner} style={{ width: `${progressBarPosition * 100}%` }}>
                <div className={styles.barShine} />
                {numPatrons > 0 ? (
                  <div className={styles.barText}>
                    {Math.max(0, vault.milestone.target - numPatrons)} patrons to go!
                  </div>
                ) : (
                  <div className={styles.barText}>
                    <Loader />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.assetList}>
        {vault.assets.map((slug) => (
          <Link href="/a/[id]" as={`/a/${slug}`} className={styles.asset} key={slug}>
            <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${slug}.png?width=192&height=90 `} />
          </Link>
        ))}
        <Link href={`/vaults/${vault.id}`} className={styles.arrow}>
          <MdArrowForward />
        </Link>
      </div>
    </div>
  )
}

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
        <h1>The Vaults</h1>
        <p>
          <strong>Support the future of free assets and unlock The Vaults.</strong>
        </p>
        <p>
          Assets are available in Early Access to Patreon supporters, but will be released freely when their goal is
          met.
        </p>
      </div>

      <div className={styles.vaultsList}>
        {Object.keys(vaults).map((vaultId) => (
          <Vault key={vaultId} vault={vaults[vaultId]} numPatrons={numPatrons} />
        ))}
      </div>

      <h1>How it Works:</h1>
      <p>
        Poly Haven creates only free and public domain 3D assets, but to fund our work we have locked away some of our
        content behind a temporary paywall: The Vaults.
      </p>
      <p>
        Each vault has a specific funding goal, defined by a target number of{' '}
        <a href="https://www.patreon.com/polyhaven">Patreon</a> members. Once this goal is reached, the vault is
        released freely for everyone.
      </p>
      <p>Until then, you can support us on Patreon to access the content inside all the vaults.</p>
      <p>
        Not only do you get immediate access to all {numAssets} vaulted assets, but you also help bring those assets
        freely to everyone in the future.
      </p>

      <h2>Donate $3+ per month to unlock {numAssets} assets and support our work.</h2>
      <DonationBox />

      <h1>FAQ</h1>
      <h2>What is a Vault?</h2>
      <p>
        A vault is a collection of assets that are temporarily locked away until we reach a funding goal. Once the goal
        is reached, the vault is released freely for everyone.
      </p>
      <h2>How do I access the Vaults?</h2>
      <p>
        To access the vaults, you need to support us on Patreon with at least $3 per month. Once you become a patron,
        you will receive access to all the assets inside the vaults. Simply <a href="/account">log in</a> with your
        Patreon account, and the assets will become accessible to you.
      </p>
      <h2>Why are the Vaults locked?</h2>
      <p>
        The vaults are locked to help fund our work. Poly Haven is a small team of artists and developers who create
        free and public domain 3D assets. We rely on the support of our patrons to keep creating new content.
      </p>
      <p>
        We do not want to lock away our content, but we need to fund our work. The vaults are a temporary solution to
        help us reach our funding goals and provide free content to everyone.
      </p>
      <h2>What happens when a Vault is released?</h2>
      <p>
        When a vault is released, all the assets inside the vault are made freely available to everyone. This means that
        anyone can download and use the assets without any restrictions.
      </p>
      <p>Once a vault is released, it will remain free and public domain forever.</p>
      <p>
        We will anounce the release on Patreon, as well as social media. The vault page will be removed, and the assets
        will become available for free download.
      </p>
      <h2>What if we don't reach the funding goals?</h2>
      <p>
        The vaults will remain locked until the target number of patrons is reached. If a vault remains locked for a
        very long time, we will evaluate the situation and consider alternative ways to release the assets. Our goal is
        to make all assets freely available eventually, but we rely on the support of our community to make this
        possible. Your contributions help us continue creating high-quality, free content for everyone.
      </p>
    </div>
  )
}

export default VaultLanding
