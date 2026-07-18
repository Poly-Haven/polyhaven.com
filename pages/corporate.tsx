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
      title="Corporate Partnerships"
      description="Guidance for companies integrating Poly Haven, arranging a provenance attestation or bulk snapshot, or funding new work."
      url="/corporate"
    >
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Corporate Partnerships</h1>

        <p>
          Poly Haven assets are free to use under CC0. This page is for companies that want to build products on top of
          our library, arrange a bulk asset snapshot, or fund new work directly.
        </p>
        <p>
          Our live <Link href="/our-api">API</Link> is free for everyone, for any purpose, including commercial use -
          forever. There is no license to arrange and no fee for access. What we do offer, on a bespoke basis, is the
          operational layer around that free data: a compliance-grade provenance guarantee, or a bulk snapshot with no
          API dependency. The options below are designed for teams that need one of those, or want to fund new work
          directly.
        </p>

        <section>
          <h2>How companies work with Poly Haven</h2>
          <p>There are four common ways companies engage with us:</p>
          <ul>
            <li>
              <strong>Building a product or workflow on our live API:</strong> no special arrangement needed - it's free
              and open for commercial use by default. See <Link href="/our-api">/our-api</Link>.
            </li>
            <li>
              <strong>Need a compliance-grade guarantee of an asset's origin:</strong> Provenance Attestation.
            </li>
            <li>
              <strong>Need a full copy of the library with no API dependency:</strong> Bulk Snapshots.
            </li>
            <li>
              <strong>Want to fund new captures, scans, or infrastructure:</strong> Sponsored Projects.
            </li>
          </ul>
          <p>
            If you're unsure which option fits your use case, <Link href="/about-contact">contact us</Link> with a short
            description of your product or requirements.
          </p>
        </section>

        <div style={styleRow}>
          <InfoBlock title="Provenance Attestation" image={<MdLink />} imageStyle={{ color: '#ffa726' }}>
            <p>
              A signed manifest for an asset or snapshot: asset ID and version, SHA-256 content hash, CC0 confirmation,
              our &quot;made by humans, no generative AI&quot; attestation, contributor chain of custody, and capture
              metadata.
            </p>
            <p>
              It's signed with Ed25519, and our public key is published so buyers can verify it independently rather
              than take our word for it.
            </p>
            <p>
              Companies pay for the warranty, not the (already free) assets - a document your own legal or compliance
              review can point to. That matters more every year in an AI-training and compliance-heavy world where
              &quot;can you prove this was clean and human-made&quot; is a real question. Bespoke, negotiated per case -{' '}
              <Link href="/about-contact">contact us</Link> to discuss it.
            </p>
          </InfoBlock>
          <InfoBlock title="Bulk Snapshots" image={<MdCloudDownload />} imageStyle={{ color: '#b3e5fc' }}>
            <p>
              A point-in-time export of exactly the files, formats, and resolutions you need, cut on demand and
              delivered directly, without depending on our live API or infrastructure.
            </p>
            <p>
              It's a good fit for embedded asset libraries, internal mirrors, AI datasets, and any product that needs a
              fixed, reproducible asset set. Every snapshot ships bundled with its own provenance attestation manifest.
            </p>
            <p>
              This isn't a recurring product or a self-serve download - each snapshot is a bespoke, negotiated contract.{' '}
              <Link href="/about-contact">Contact us</Link> to scope one out.
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
            <p>
              The assets and the API to reach them are free, forever, for everyone. Companies that depend on the library
              in production still choose to fund the operational layer around it:
            </p>
            <ul>
              <li>A signed, independently verifiable provenance and CC0 warranty for legal or compliance review.</li>
              <li>A reproducible bulk snapshot, delivered directly, with no dependency on our live infrastructure.</li>
              <li>A direct relationship with us if your product depends on the library in production.</li>
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
            If you need a provenance attestation, a bulk snapshot, or want to fund a sponsored project, send us a short
            description of your product, workflow, or requirements.
          </p>
          <Button text="Contact Poly Haven" href="/about-contact" color="accent" />
        </div>
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
    revalidate: 60 * 60 * 4, // 4 hours
  }
}

export default Corporate
