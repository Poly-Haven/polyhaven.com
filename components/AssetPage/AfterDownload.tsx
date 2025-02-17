import { useEffect, useState } from 'react'
import Link from 'next/link'

import asset_type_names from 'constants/asset_type_names.json'
import { randomArraySelection } from 'utils/arrayUtils'
import { ordinalSuffix } from 'utils/stringUtils'

import DonationBox from 'components/DonationBox/DonationBox'

import styles from './AssetPage.module.scss'

const AfterDownload = ({ assetType, postDownloadStats }) => {
  const [visible, setVisible] = useState(true)
  const [prompt, setPrompt] = useState({ title: '', message: '', icon: '' })
  const [localUserDownloadCount, setLocalUserDownloadCount] = useState('0')
  useEffect(() => {
    setLocalUserDownloadCount(localStorage.getItem(`userDownloadCount`) || '0')
  }, [])

  useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setVisible(true)
      }, 2000)
    }
  }, [visible])

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
        ].toLowerCase()} was crafted with love by a creator just like you. If you find value in our work, consider supporting our creative mission on Patreon.`,
        icon: '🚀',
      },
      {
        title: `Made by artists, for artists.`,
        message: `We're not just a website - we're a community of passionate creators. Help us keep this dream alive!`,
        icon: '🎨',
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
                  parseInt(localUserDownloadCount)
              )}
            </Link>{' '}
            more downloads!
          </span>
        ),
        icon: '🎉',
      },
    ],
    third: [
      {
        title: `Three downloads and counting!`,
        message: `We're so happy you love our assets <3 If they've been a game-changer for you, consider supporting our work.`,
        icon: '🌟',
      },
    ],
  }

  const shufflePrompt = () => {
    let newPrompt = null
    while (newPrompt === null || newPrompt.title === prompt.title) {
      newPrompt = randomArraySelection(prompts.generic)
    }
    setPrompt(newPrompt)
  }

  useEffect(() => {
    setPrompt(randomArraySelection(prompts.generic))
  }, [])

  return (
    <div className={styles.afterDownload} style={visible ? {} : { top: '-100px' }}>
      <div className={styles.prompt} onClick={() => setVisible(!visible)}>
        <div className={styles.promptHeader}>
          <em>{prompt.icon}</em>
          <h3>{prompt.title}</h3>
        </div>
        <p>{prompt.message}</p>
      </div>
      <DonationBox />
    </div>
  )
}

export default AfterDownload
