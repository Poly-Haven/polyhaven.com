import Link from 'next/link';
import fs from 'fs'
import path from 'path'
import Markdown from 'markdown-to-jsx';
import { subMonths, startOfMonth, endOfMonth } from 'date-fns'

import { IoTicket } from 'react-icons/io5'
import { MdCloudDownload, MdCropFree, MdLink, MdChat, MdInfo } from 'react-icons/md';

import { timeago, fixTzOffset, isoDay } from 'utils/dateUtils';

import InfoBlock from 'components/Layout/InfoBlock/InfoBlock';
import TierBlock from 'components/Layout/TierBlock/TierBlock';
import TextPage from 'components/Layout/TextPage/TextPage'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'

const Corporate = (props) => {

  const commonRewards = [
    {
      icon: <MdLink />,
      color: '#ffa726',
      text: <>Your logo can link to your website or product page.</>
    },
    {
      icon: <IoTicket />,
      color: '#be6fff',
      text: <>Monthly asset sponsorships. <MdInfo data-tip="Every month you may choose an asset to sponsor permanently.<br />Your logo &amp; link will be shown on the asset page near the download buttons.<br />You can also choose to have the asset selected randomly for you each month." /></>
    },
    {
      icon: <MdChat />,
      color: '#9ccc65',
      text: <>Access our private internal communication channels and help us discuss what to work on.</>
    },
    {
      icon: <MdCloudDownload />,
      color: '#b3e5fc',
      text: <>Nextcloud library access for your team.</>
    },
  ]

  return (
    <TextPage
      title="Corporate Sponsorships"
      description="Does your organization want to support our vision and associate themselves with our project in the public eye?"
      url="/corporate"
    >
      <h1>Corporate Sponsorships</h1>

      <p>Does your organization want to support our vision and associate themselves with our project in the public eye?</p>
      <p>Show your logo prominently in various locations on our site, gain access to our private communication channels to help us discuss what to work on, and have your whole team join our cloud library for easier integration with your workflow.</p>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2em' }}>
        <InfoBlock title="Display Your Logo" image={<MdCropFree />} imageStyle={{ color: '#ef5350' }}>
          <p>Show your logo prominently in various locations on our site. Your logo links to your website.</p>
        </InfoBlock>
        <InfoBlock title="Talk To Us" image={<MdChat />} imageStyle={{ color: '#9ccc65' }}>
          <p>Gain access to our private communication channels to help us decide what to work on.</p>
        </InfoBlock>
        <InfoBlock title="Cloud Library" image={<MdCloudDownload />} imageStyle={{ color: '#b3e5fc' }}>
          <p>Have your whole studio join our cloud library for easier integration with your workflow.</p>
        </InfoBlock>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2em' }}>
        <InfoBlock title="About Poly Haven">
          <p>Our goal is to provide high quality assets to 3D creators, released as public domain for absolute freedom and usability in both commercial and private applications.</p>
          <p>There are no costs, restrictions, or registrations required to download or use our assets.</p>
          <p>We have been operating independently for over 3 years and have seen consistent growth in all capacities. Our work has already been used in a number of AAA studios, scientific research, and has been included by default in several 3D applications.</p>
        </InfoBlock>
        <InfoBlock title="Audience Stats">
          <p>Recent approximate stats for polyhaven.com, based on data from Cloudflare analytics.</p>
          <ul>
            <li>Pageviews: <strong>{(props.traffic.pageviews / 1000000).toFixed(1)} million</strong> per month.</li>
            <li>Asset Downloads: <strong>{(props.monthlyDownloads / 1000000).toFixed(1)} million</strong> per month.</li>
            <li>Download Traffic: <strong>{(props.traffic.terabytes).toFixed(1)}TB</strong> per month.</li>
            <li>Facebook / Twitter followers: <strong>8.4K / 5.1K</strong>.</li>
            {props.numPatrons && <li>Patreon Supporters: <strong>{props.numPatrons}</strong>.</li>}
          </ul>
          <p style={{ opacity: 0.5, textAlign: 'right' }}><em>Last updated: {timeago(props.updated)}</em></p>
        </InfoBlock>
      </div>

      <table>

      </table>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2em' }}>
        <TierBlock
          title="Silver"
          image={<img src="https://cdn.polyhaven.com/site_images/icons/corp_silver.svg" />}
          price="100"
          link="https://polyhaven.gumroad.com/l/ph-corporate?tier=Silver"
          features={[
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <><strong>Small white silhouette logo</strong> in the footer of every page.</>
            },
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <><strong>Small white silhouette logo</strong> on the <Link href="/about">About Page</Link>.</>
            },
            ...commonRewards
          ]}
        />
        <TierBlock
          title="Gold"
          image={<img src="https://cdn.polyhaven.com/site_images/icons/corp_gold.png" />}
          price="300"
          numExisting={props.numGold}
          limit={8}
          link="https://polyhaven.gumroad.com/l/ph-corporate?tier=Gold"
          features={[
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <><strong>Larger white silhouette logo</strong> on the <Link href='/'>Home Page</Link>.</>
            },
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <>Your logo is also shown in the Footer of every page, and on the <Link href="/about">About Page</Link>.</>
            },
            ...commonRewards
          ]}
        />
        <TierBlock
          title="Diamond"
          image={<img src="https://cdn.polyhaven.com/site_images/icons/corp_diamond.svg" />}
          price="1,000"
          numExisting={props.numDiamond}
          limit={4}
          link="https://polyhaven.gumroad.com/l/ph-corporate?tier=Diamond"
          features={[
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <><strong>Full color logo</strong> on the <Link href='/'>Home Page</Link>.</>
            },
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <>Your logo is <strong>larger</strong> and shown <strong>above</strong> lower tier sponsors.</>
            },
            {
              icon: <MdCropFree />,
              color: '#ef5350',
              text: <>Your logo is also shown in the Footer of every page, and on the <Link href="/about">About Page</Link>.</>
            },
            ...commonRewards
          ]}
        />
      </div>

      <CorporateSponsors header="Our Current Sponsors:" hideInfoBtn />

      <hr />

      <h1>More Details</h1>

      <div lang="en">
        <Markdown>{props.details.replace(/\\n/g, '\n')}</Markdown>
      </div>

    </TextPage>
  )
}


export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.polyhaven.com"

  // Patron count
  const patrons = await fetch(`${baseUrl}/patrons`)
    .then(response => response.json())
    .catch(e => error = e)

  // Slots available
  const corporate = await fetch(`${baseUrl}/corporate`)
    .then(response => response.json())
    .catch(e => error = e)
  const diamondSponsors = Object.keys(corporate).filter(s => corporate[s].rank === 3);
  const goldSponsors = Object.keys(corporate).filter(s => corporate[s].rank === 2);

  // Asset downloads
  const now = new Date()
  const monthAgo = subMonths(now, 1)
  const dateFrom = isoDay(fixTzOffset(startOfMonth(monthAgo)))
  const dateTo = isoDay(fixTzOffset(endOfMonth(monthAgo)))
  const dailyDownloads = await fetch(`${baseUrl}/stats/downloads?type=ALL&slug=ALL&date_from=${dateFrom}&date_to=${dateTo}`)
    .then(response => response.json())
    .catch(e => error = e)
  let monthlyDownloads = 0;
  for (const day of dailyDownloads) {
    monthlyDownloads += day.downloads
  }

  // Traffic
  const traffic = await fetch(`${baseUrl}/stats/cfmonth`)
    .then(response => response.json())
    .catch(e => error = e)

  // Text
  const fp = path.join(process.cwd(), 'constants/corporate_details.md')
  const details = fs.readFileSync(fp, 'utf8')

  if (error) {
    return {
      props: {},
      revalidate: 60 * 5 // 5 minutes
    }
  }

  return {
    props: {
      updated: now.valueOf(),
      numPatrons: patrons.length,
      numDiamond: diamondSponsors.length,
      numGold: goldSponsors.length,
      details,
      monthlyDownloads,
      traffic
    },
    revalidate: 60 * 30 // 30 minutes
  }
}

export default Corporate