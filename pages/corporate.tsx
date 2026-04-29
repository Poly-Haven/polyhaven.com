import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import CSS from 'csstype'
import { subMonths, startOfMonth, endOfMonth, differenceInYears } from 'date-fns'

import { MdCloudDownload, MdCropFree, MdLink, MdInfo } from 'react-icons/md'

import { timeago, fixTzOffset, isoDay } from 'utils/dateUtils'

import InfoBlock from 'components/Layout/InfoBlock/InfoBlock'
import TextPage from 'components/Layout/TextPage/TextPage'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'
import StatBlock from 'components/Stats/StatBlock/StatBlock'
import Tooltip from 'components/UI/Tooltip/Tooltip'
import Button from 'components/UI/Button/Button'

const Corporate = (props) => {
  const { t: tt } = useTranslation('time')

  const styleRow: CSS.Properties = {
    display: 'flex',
    flexDirection: 'row',
    gap: '2em',
    flexWrap: 'wrap',
  }

  const ctaStyle: CSS.Properties = {
    textAlign: 'center',
    margin: '3em auto 1em',
    maxWidth: '42rem',
  }

  return (
    <TextPage
      title="Commercial Licensing & Partnerships"
      description="Guidance for companies integrating Poly Haven, licensing asset snapshots, or funding new work."
      url="/corporate"
    >
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Commercial Licensing & Partnerships</h1>

        <p>
          Poly Haven assets are free to use under CC0. This page is for companies that want to build products on top of
          our library, license a fixed asset snapshot, or fund new work directly.
        </p>
        <p>
          Most teams can use our assets without contacting us. If you need structured API access, bulk delivery,
          commercial guarantees, or a direct partnership around new asset creation, the options below are designed for
          that.
        </p>

        <section>
          <h2>How companies work with Poly Haven</h2>
          <p>There are three common ways companies engage with us:</p>
          <ul>
            <li>
              <strong>Building a product or workflow on top of our live data:</strong> API / Integration License.
            </li>
            <li>
              <strong>Need a full copy of the library with no API dependency:</strong> Bulk Asset License.
            </li>
            <li>
              <strong>Want to fund new captures, scans, or infrastructure:</strong> Sponsored Projects.
            </li>
          </ul>
          <p>
            If you&apos;re unsure which option fits your use case, <Link href="/about-contact">contact us</Link> with a
            short description of your product or requirements.
          </p>
        </section>

        <div style={styleRow}>
          <InfoBlock title="API & Integration Licensing" image={<MdLink />} imageStyle={{ color: '#ffa726' }}>
            <p>
              For companies building products, plugins, AI tools, or SaaS workflows on top of Poly Haven&apos;s live
              asset data.
            </p>
            <p>
              Our standard commercial model is a 5% revenue share with a minimum annual fee, which keeps access simple
              for smaller teams while scaling with commercial use.
            </p>
            <p>
              Larger companies can move to an enterprise agreement for higher usage, internal approvals, and closer
              coordination around long-term integrations.
            </p>
          </InfoBlock>
          <InfoBlock title="Bulk Asset Licensing" image={<MdCloudDownload />} imageStyle={{ color: '#b3e5fc' }}>
            <p>
              This is for teams that need a fixed snapshot of Poly Haven assets delivered directly, without depending on
              our API or infrastructure.
            </p>
            <p>
              It is a good fit for embedded asset libraries, internal mirrors, AI datasets, and products that need a
              stable, reproducible asset set.
            </p>
            <p>
              Redistribution rights, provenance guarantees, and other commercial assurances can be added when needed.
            </p>
          </InfoBlock>
        </div>

        <div style={styleRow}>
          <InfoBlock title="Sponsored Projects" image={<MdCropFree />} imageStyle={{ color: '#ef5350' }}>
            <p>
              Sponsored projects fund real work: HDRI trips, texture collections, scanning equipment, processing
              hardware, and site infrastructure.
            </p>
            <p>
              This is not just brand placement. Companies fund a specific outcome that benefits both their team and the
              wider community.
            </p>
            <p>
              Sponsorship benefits still scale with contribution size, from acknowledgements and logo placement through
              to deeper collaboration.
            </p>
          </InfoBlock>
          <InfoBlock title="Why Companies Work With Us" image={<MdInfo />} imageStyle={{ color: '#9ccc65' }}>
            <p>Even though the assets are free, companies often pay for the operational layer around them:</p>
            <ul>
              <li>Structured API access, metadata, and integration support.</li>
              <li>Reliability, updates, and a stable relationship for production use.</li>
              <li>Provenance clarity and commercial assurances where required.</li>
              <li>Bulk delivery for internal mirrors, datasets, and embedded libraries.</li>
              <li>Supporting the continued creation of new public-domain assets.</li>
            </ul>
          </InfoBlock>
        </div>

        <CorporateSponsors header="Our Current Sponsors:" hideInfoBtn />

        <div style={styleRow}>
          <InfoBlock title="About Poly Haven">
            <p>
              Poly Haven provides high quality assets to 3D creators, released as public domain so they can be used
              freely in both commercial and private work.
            </p>
            <p>There are no costs, restrictions, or registrations required to download or use our assets.</p>
            <p>
              We have been operating independently for over {differenceInYears(new Date(), new Date('2017-10-03'))}{' '}
              years with steady growth. Our work is already used by AAA studios, scientific research teams, and several
              3D applications that include Poly Haven assets by default.
            </p>
          </InfoBlock>
          <InfoBlock title="Audience Stats">
            <p>
              Monthly stats for polyhaven.com, based on data from Cloudflare analytics and our own internal tracking.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
              }}
            >
              <StatBlock head={`${(props.traffic.users / 1000000).toFixed(1)}M`} text="Users" />
              <StatBlock head={`${(props.monthlyDownloads / 1000000).toFixed(1)}M`} text="Downloads" />
              <StatBlock head={`${Math.round(props.traffic.terabytes)}TB`} text="Traffic" />
              <StatBlock head={props.numPatrons} text="Patrons" />
            </div>
            <p
              style={{ opacity: 0.5, textAlign: 'right' }}
              data-tip={`Stats automatically updated:<br/>${new Date(props.updated).toLocaleString('en-ZA')}`}
            >
              <em>Last updated: {timeago(props.updated, tt)}</em>
            </p>
          </InfoBlock>
        </div>

        <div style={ctaStyle}>
          <h2>Talk To Us About Your Use Case</h2>
          <p>
            If you need API licensing, a bulk asset delivery, or a sponsored project, send us a short description of
            your product, workflow, or requirements.
          </p>
          <Button text="Contact Poly Haven" href="/about-contact" color="accent" />
        </div>

        <Tooltip />
      </div>
    </TextPage>
  )
}

export async function getStaticProps(context) {
  let error = null
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.polyhaven.com'

  // Patron count
  const patrons = await fetch(`${baseUrl}/patrons`)
    .then((response) => response.json())
    .catch((e) => (error = e))

  // Asset downloads
  const now = new Date()
  const monthAgo = subMonths(now, 1)
  const dateFrom = isoDay(fixTzOffset(startOfMonth(monthAgo)))
  const dateTo = isoDay(fixTzOffset(endOfMonth(monthAgo)))
  const dailyDownloads = await fetch(
    `${baseUrl}/stats/downloads?type=ALL&slug=ALL&date_from=${dateFrom}&date_to=${dateTo}`
  )
    .then((response) => response.json())
    .catch((e) => (error = e))
  let monthlyDownloads = 0
  for (const day of dailyDownloads) {
    monthlyDownloads += day.downloads
  }

  // Traffic
  const traffic = await fetch(`${baseUrl}/stats/cfmonth`)
    .then((response) => response.json())
    .catch((e) => (error = e))

  if (error) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ['common', 'time'])) },
      revalidate: 60 * 5, // 5 minutes
    }
  }

  return {
    props: {
      ...(await serverSideTranslations(context.locale, ['common', 'time'])),
      updated: now.valueOf(),
      numPatrons: patrons.length,
      monthlyDownloads,
      traffic,
    },
    revalidate: 1800,
  }
}

export default Corporate
