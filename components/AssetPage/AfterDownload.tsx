import { useEffect, useState } from 'react'
import Link from 'next/link'

import asset_type_names from 'constants/asset_type_names.json'
import { randomArraySelection } from 'utils/arrayUtils'
import { ordinalSuffix } from 'utils/stringUtils'

import { MdClose } from 'react-icons/md'

import DonationBox from 'components/DonationBox/DonationBox'

import styles from './AssetPage.module.scss'

const AfterDownload = ({ show, assetType, postDownloadStats }) => {
  const [prompt, setPrompt] = useState({ title: '', message: '', icon: '' })

  const [localUserDownloadCount, setLocalUserDownloadCount] = useState('0')
  useEffect(() => {
    setLocalUserDownloadCount(localStorage.getItem(`userDownloadCount`) || '0')
  }, [])

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(show)
  }, [show])

  useEffect(() => {
    setPrompt(randomArraySelection(prompts.generic))
  }, [])

  const prompts = {
    generic: [
      {
        title: 'Free to download, but not free to create.',
        message: (
          <span>
            An average asset costs us{' '}
            <Link
              href="/finance-reports"
              title={`Average monthly expenses / average assets published per month ($${Math.round(
                postDownloadStats.averageMonthlyExpenses
              )} / ${postDownloadStats.averageAssetsPerMonth.toFixed(2)})`}
            >
              ${Math.round(postDownloadStats.averageMonthlyExpenses / postDownloadStats.averageAssetsPerMonth)}
            </Link>{' '}
            to make. Consider supporting our work to keep them free for everyone.
          </span>
        ),
        icon: '💵',
      },
      {
        title: `Join the cult!`,
        message: `This ${asset_type_names[
          assetType
        ].toLowerCase()} was crafted with love by a creator just like you. If you find value in our work, consider supporting our mission on Patreon.`,
        icon: '🚀',
      },
      {
        title: `Every ${asset_type_names[assetType].toLowerCase()} is a labor of love.`,
        message: `Peek behind the curtain and support the creators who spend countless hours perfecting these ${asset_type_names[
          assetType
        ].toLowerCase()}s for you.`,
        icon: '❤️',
      },
      {
        title: `We can't do this without you.`,
        message: `More than 99.9% of users download this ${asset_type_names[
          assetType
        ].toLowerCase()} without supporting us. Join the 0.1% to keep Poly Haven alive.`,
        icon: '💀',
      },
      {
        title: `Stick 'em up!`,
        message: `Alright, pal, hand over the... loose change? No? How about a small donation to keep this asset free for everyone?`,
        icon: '🔪',
      },
      {
        title: `Spare some change?`,
        message: `We're not asking for your firstborn, just a few bucks. Pretty please?  With a cherry on top? (Okay, maybe not the cherry.)`,
        icon: '🥺',
      },
      {
        title: `We're not kitten around`,
        message: `Your generous donation is required. Or else... we'll just be really, really sad.`,
        icon: '😿',
      },
      {
        title: `Pay up, peasant!`,
        message: `We're so desperate for donations, we're resorting to mildly threatening language. Think of the starving artists... who create ${asset_type_names[
          assetType
        ].toLowerCase()}s... and also eat sometimes.`,
        icon: '😤',
      },
      {
        title: `Congratulations on your ${ordinalSuffix(parseInt(localUserDownloadCount) + 1)} download!`,
        message: (
          <span>
            Poly Haven is a community-supported platform, donate $5 and cover the hosting fees for{' '}
            <Link
              href="/stats"
              title={`MonthlyDownloads/MonthlyWebHostingFees = DownloadsPerDollar, then *5 for $5. I.e. (${
                postDownloadStats.numMonthlyDownloads
              }/${postDownloadStats.averageMonthlyWebHostingFees.toFixed(2)})*5 = ${Math.round(
                (postDownloadStats.numMonthlyDownloads / postDownloadStats.averageMonthlyWebHostingFees) * 5
              )} downloads per $5`}
            >
              {Math.round(
                (postDownloadStats.numMonthlyDownloads / postDownloadStats.averageMonthlyWebHostingFees) * 5 -
                  parseInt(localUserDownloadCount) -
                  1
              )}
            </Link>{' '}
            more downloads!
          </span>
        ),
        icon: '🎉',
      },
      {
        title: `Keep the downloads coming!`,
        message: `We're so happy you love our assets. If they've been a game-changer for you, consider supporting our work.`,
        icon: '🌟',
      },
    ],
  }

  // If less than 3 downloads total, don't show the popup.
  if (parseInt(localUserDownloadCount) < 2) {
    return null
  }

  const nextPrompt = () => {
    // Pick the next prompt in the list
    let newPrompt = null
    let promptIndex = prompts.generic.findIndex((p) => p.title === prompt.title)
    if (promptIndex === -1) {
      newPrompt = randomArraySelection(prompts.generic)
    } else {
      newPrompt = prompts.generic[(promptIndex + 1) % prompts.generic.length]
    }
    setPrompt(newPrompt)
  }

  return (
    <div className={`${styles.afterDownload} ${visible ? '' : styles.collapseAfterDownload}`}>
      <MdClose
        className={styles.close}
        onClick={() => {
          setVisible(false)
        }}
      />
      <div className={styles.prompt}>
        <div className={styles.promptHeader}>
          <em onDoubleClick={nextPrompt}>{prompt.icon}</em>
          <h3>{prompt.title}</h3>
        </div>
        <p>{prompt.message}</p>
      </div>
      <DonationBox />
    </div>
  )
}

export default AfterDownload
