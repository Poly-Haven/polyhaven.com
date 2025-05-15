import { useState, useEffect } from 'react'
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

      <div className={styles.infoSection}>
        <div className={styles.row}>
          <FaqItem question="How it Works:" qID="how-it-works" activeQ={clicked} main>
            <p>
              Poly Haven creates free and public domain 3D assets. To help fund our work, we have locked some new
              collections of assets behind a temporary paywall: The Vaults.
            </p>
            <p>
              Each Vault has a specific funding goal, defined by a target number of{' '}
              <a href="https://www.patreon.com/polyhaven">Patreon</a> members. Once this goal is reached, the Vault is
              released freely for everyone.
            </p>
            <p>
              For example, the next Vault, <Link href={`/vaults/${nextVault['id']}`}>{nextVault['name']}</Link>,
              contains {nextVault['assets'].length} assets and will be unlocked once we reach {nextVault['target']}{' '}
              total patrons ({nextVault['target'] - numPatrons} to go!).
            </p>
            <p>
              Until then, support us on Patreon to access the content inside <strong>all</strong> the Vaults.
            </p>
            <p>
              Not only do you get <strong>immediate access to all {numAssets} vaulted assets</strong>, but you also help
              release them for free to the public more quickly.
            </p>
            <p>
              All funding goes towards creating more assets - see our{' '}
              <Link href="/finance-reports">finance reports</Link>.
            </p>
          </FaqItem>

          <div className={styles.donationBox}>
            <h2 style={{ textAlign: 'center' }}>
              Donate <span className={styles.green}>$3+</span> per month to unlock {numAssets} assets and support our
              work.
            </h2>
            <DonationBox />
          </div>
        </div>
      </div>

      <Roadmap vaults />

      <div className={styles.textSection} style={{ marginBottom: '5em' }}>
        <h1>FAQ</h1>
        <FaqItem question="What is a Vault?" qID="what" activeQ={clicked}>
          <p>
            A Vault is a collection of assets that are temporarily locked away until we reach a funding goal. Once the
            goal is reached, the Vault is released freely for everyone.
          </p>
        </FaqItem>

        <FaqItem question="Are all your future assets going to be locked in a Vault?" qID="future" activeQ={clicked}>
          <p>
            No! We are still publishing new free assets in addition to the Vaults - about one new asset every week day.
          </p>
          <p>The Vaults are in addition to our regular free content, not a replacement.</p>
          <p>
            Similarly, all of our community projects and donated assets will always be immediately free to the public.
            Only large collections that require significant investment to create ourselves may be locked in a Vault.
          </p>
          <p>And remember, every asset (even those in the Vaults) will eventually be free for everyone.</p>
        </FaqItem>

        <FaqItem question="How do I access the Vaults?" qID="how" activeQ={clicked}>
          <p>
            You need to support us on <a href="https://www.patreon.com/polyhaven">Patreon</a> with at least $3 per
            month. Once you become a patron, you will receive access to all the assets inside all of the Vaults.
          </p>
          <p>
            On this website, simply <a href="/account">log in</a> with your Patreon account, and you will be able to
            download the assets.
          </p>
          <p>
            In <Link href="/plugins/blender">our Blender add-on</Link>, the vaulted assets will automatically be
            downloaded when you click "Fetch Assets".
          </p>
        </FaqItem>

        <FaqItem question="Is this like a crowdfunding project or Patreon goal?" qID="crowdfunding" activeQ={clicked}>
          <p>
            In a way, yes. In the past, we tried both Patreon goals and crowdfunding campaigns, with the promise that
            once we reached the funding goal we would start working on the project.
          </p>
          <p>
            This is similar, except we work on the project up front before the funding goal is reached, trusting that
            our community will support us and cover the funds later over time.
          </p>
          <p>
            While we have to pay for the development costs up front, this way we can work on more projects sooner, and
            reward our supporters with early access before the funding goal is met. Nobody can be disappointed by
            unfulfilled promises, and we can release the assets for free as soon as the goal is met.
          </p>
        </FaqItem>

        <FaqItem question="What happens when a Vault is released?" qID="release" activeQ={clicked}>
          <p>
            All the assets inside the Vault are made freely available to everyone as soon as the goal is reached. This
            means that anyone can download and use the assets without any restrictions.
          </p>
          <p>Once a Vault is released, it will remain free and public domain forever.</p>
          <p>
            We will anounce the release on Patreon, as well as social media. The Vault page will be removed, and the
            assets will become available for free download.
          </p>
          <p>
            Some Vaults may turn into a <Link href="/collections">collection</Link>, while others simply merge into the
            main library.
          </p>
        </FaqItem>

        <FaqItem question="What if we don't reach the funding goals?" qID="failure" activeQ={clicked}>
          <p>The Vaults will remain locked until the target number of patrons is reached.</p>
          <p>
            If a Vault remains locked for a such a long time that we are ready to upload another Vault, we will consider
            adjusting the goals to avoid having too many locked Vaults at once.
          </p>
          <p>
            Our aim is to make all assets freely available eventually, but we rely on the support of our community to
            make this possible. Your contributions help us continue creating free high-quality content for everyone.
          </p>
        </FaqItem>

        <FaqItem question="What is the license of the Vaulted assets?" qID="license" activeQ={clicked}>
          <p>
            Like the rest of our library, all assets in the Vaults are <Link href="/license">CC0</Link>.
          </p>
        </FaqItem>

        <div className={styles.row}>
          <p>
            Got a different question? <Link href="/about-contact">Contact us</Link>.
          </p>
          <div className={styles.spacer} />
          <Button
            text="Access the Vaults Now"
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
