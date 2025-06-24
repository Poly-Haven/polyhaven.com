import { useEffect, useState, useMemo } from 'react'
import { useUser } from '@auth0/nextjs-auth0/client'
import Link from 'next/link'

import asset_type_names from 'constants/asset_type_names.json'
import { randomArraySelection } from 'utils/arrayUtils'
import { ordinalSuffix } from 'utils/stringUtils'
import { useUserPatron } from 'contexts/UserPatronContext'

import { MdClose } from 'react-icons/md'

import DonationBox from 'components/DonationBox/DonationBox'
import Roadmap from 'components/Roadmap/Roadmap'

import styles from './AssetPage.module.scss'

const AfterDownload = ({ show, assetType, postDownloadStats }) => {
  const { user } = useUser()
  const { earlyAccess } = useUserPatron()
  const [prompt, setPrompt] = useState({ title: '', message: '', icon: '' })

  const [localUserDownloadCount, setLocalUserDownloadCount] = useState('0')
  useEffect(() => {
    setLocalUserDownloadCount(localStorage.getItem(`userDownloadCount`) || '0')
  }, [])

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(show)
  }, [show])

  const prompts = useMemo(() => {
    return {
      generic: [
        {
          icon: '🚀',
          title: `Join the cult!`,
          message: `This ${asset_type_names[
            assetType
          ].toLowerCase()} was crafted with love by a creator just like you. If you find value in our work, consider supporting our mission on Patreon.`,
        },
        {
          icon: '❤️',
          title: `Every ${asset_type_names[assetType].toLowerCase()} is a labor of love.`,
          message: `Peek behind the curtain and support the creators who spend countless hours perfecting these ${asset_type_names[
            assetType
          ].toLowerCase()}s for you.`,
        },
        {
          icon: '🌟',
          title: `Keep the downloads coming!`,
          message: `We're so happy you love our assets. If they've been a game-changer for you, consider supporting our work.`,
        },
        {
          icon: '💀',
          title: `We can't do this without you.`,
          message: `More than 99.9% of users download this ${asset_type_names[
            assetType
          ].toLowerCase()} without supporting us. Join the 0.1% to keep Poly Haven alive.`,
        },
        {
          icon: '💵',
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
        },
        {
          icon: '🎉',
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
        },
        {
          icon: '🔪',
          title: `Stick 'em up!`,
          message: `Alright, pal, hand over the... loose change? No? How about a small donation to keep this asset free for everyone?`,
          min: 10,
        },
        {
          icon: '🥺',
          title: `Spare some change?`,
          message: `We're not asking for your firstborn, just a few bucks. Pretty please?  With a cherry on top? (Okay, maybe not the cherry.)`,
          min: 10,
        },
        {
          icon: '😿',
          title: `We're not kitten around`,
          message: `Your generous donation is required. Or else... we'll just be really, really sad.`,
          min: 10,
        },
        {
          icon: '😤',
          title: `Pay up, peasant!`,
          message: `We're so desperate for donations, we're resorting to mildly threatening language. Think of the starving artists... who create ${asset_type_names[
            assetType
          ].toLowerCase()}s... and also eat sometimes.`,
          min: 20,
        },
        {
          icon: '😱',
          title: `Oh lawd he comin`,
          message: `You've downloaded ${
            parseInt(localUserDownloadCount) + 1
          } assets. Quite frankly we're impressed. But also a little scared. Maybe a donation would calm our nerves?`,
          min: 50,
        },
        {
          icon: '🌳',
          title: `Assets don't grow on trees`,
          message: `We wish they did, but alas, you've downloaded ${
            parseInt(localUserDownloadCount) + 1
          } of them and things are getting bare. Help us plant some new ones?`,
          min: 100,
        },
        {
          icon: '🌞',
          title: `Get a life!`,
          message: `You've downloaded ${
            parseInt(localUserDownloadCount) + 1
          } assets. We're not judging, but maybe it's time to step away and go outside? Or donate to keep them coming...`,
          min: 200,
        },
        {
          icon: '😟',
          title: `We're worried about you`,
          message: `You've downloaded ${
            parseInt(localUserDownloadCount) + 1
          } assets. That's... a lot. Are you okay? Do you need help? Maybe you'll feel better if you donate...`,
          min: 500,
        },
        {
          title: `That's enough now`,
          message: `Seriously? ${
            parseInt(localUserDownloadCount) + 1
          } assets? We're cutting you off. No more downloads until you donate. Just kidding. But seriously, please donate.`,
          icon: '🚫',
          min: 1000,
        },
      ],
    }
  }, [localUserDownloadCount])

  useEffect(() => {
    let chosenPrompt = null
    while (chosenPrompt === null) {
      chosenPrompt = randomArraySelection(prompts.generic)
      if (chosenPrompt.min && parseInt(localUserDownloadCount) < chosenPrompt.min) {
        chosenPrompt = null
      }
    }
    setPrompt(chosenPrompt)
  }, [prompts])

  // If less than 3 downloads total, or user is logged in, don't show the popup.
  if (earlyAccess || parseInt(localUserDownloadCount) < 2 || user) {
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
      <Roadmap mini />
    </div>
  )
}

export default AfterDownload
