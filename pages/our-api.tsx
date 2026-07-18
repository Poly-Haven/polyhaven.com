import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { MdCampaign } from 'react-icons/md'

import TextPage from 'components/Layout/TextPage/TextPage'
import CodeBlock from 'components/UI/CodeBlock/CodeBlock'
import Button from 'components/UI/Button/Button'
import InfoBox from 'components/UI/InfoBox/InfoBox'
import styles from 'components/Layout/TextPage/TextPage.module.scss'

const EXAMPLE_CURL = 'curl -H "User-Agent: MyAssetBrowser/1.0" https://api.polyhaven.com/assets'
const EXAMPLE_FILES_CURL = 'curl -H "User-Agent: MyAssetBrowser/1.0" https://api.polyhaven.com/files/sunset_jhbcentral'

const exampleAPIOutput = {
  sunset_jhbcentral: {
    name: 'Joburg Central Sunset',
    description:
      'Free, unclipped 24K HDRI of a low-contrast rooftop sunset, cool twilight with pink clouds, building skyline, soft warm light and muted tones.',
    category: 'Streets & Town/Rooftops & Balconies/City Rooftops',
    tags: ['city', 'roof', 'skyline', 'building', 'architecture', 'industrial', 'pink', 'twilight'],
    attributes: {
      time_of_day: 'dusk',
      weather: 'partly_cloudy',
      light_type: 'natural',
      contrast: 'low',
      open_sky: true,
    },
    thumbnail_url: 'https://cdn.polyhaven.com/asset_img/thumbs/sunset_jhbcentral.png?width=256&height=256',
    max_resolution: [24576, 12288],
    download_count: 269506,
    authors: {
      'Greg Zaal': 'Processing',
      'Dimitrios Savva': 'Photography',
    },
    date_published: 1633305600,
    date_taken: 1621531620,
    coords: [-26.205388, 28.039787],
    whitebalance: 5319,
    evs_cap: 12,
    category_id: '8133f881-e55d-5c6c-a360-99dbf7204ee5',
    files_hash: 'e2e14a204ee06104209396caa9e7b40322dbb3d4',
    type: 0,
  },
  concrete_floor_01: {
    name: 'Concrete Floor 01',
    description:
      'Free 8K texture: weathered outdoor concrete floor with granular, rough surface and embedded stones and gravel, matte and slightly worn.',
    category: 'Concrete/Cast Walls & Floors/Exposed Aggregate',
    tags: [
      'rough',
      'park',
      'concrete',
      'cement',
      'rough  ',
      'stone embedded',
      'gravel embedded',
      'weathered',
      'granular',
    ],
    attributes: {
      surface_use: 'floor',
      man_made: true,
      outdoor: true,
      condition: ['weathered', 'worn'],
    },
    thumbnail_url: 'https://cdn.polyhaven.com/asset_img/thumbs/concrete_floor_01.png?width=256&height=256',
    max_resolution: [8192, 8192],
    dimensions: [2000, 2000],
    download_count: 100463,
    authors: {
      'Rob Tuytel': 'All',
    },
    date_published: 1531734768,
    category_id: '70d3bf8f-46b0-5250-a419-61cbf068f448',
    files_hash: 'dd25145843a1f743897b3188e42822705db331e6',
    type: 1,
  },
  dirty_football: {
    name: 'Dirty Football',
    description:
      'Free 8K model of a weathered, dirty soccer ball with stitched panels, scuffs, faded leather tones and realistic dirt buildup for a well-used vintage look.',
    category: 'Leisure/Sports/Balls',
    tags: ['shed', 'toy', 'soccer', 'sports', 'sport', 'ball', 'game', 'field', 'stadium', 'dirty', 'dirt'],
    attributes: {
      condition: 'worn',
      material: ['leather', 'rubber'],
    },
    thumbnail_url: 'https://cdn.polyhaven.com/asset_img/thumbs/dirty_football.png?width=256&height=256',
    max_resolution: [8192, 8192],
    dimensions: [221.3953733444214, 220.00925242900848, 220.0465425848961],
    polycount: 37486,
    texel_density: 15995.23414260915,
    download_count: 7895,
    authors: {
      'Rohit Seervi': 'All',
    },
    date_published: 1697846400,
    donated: true,
    lods: true,
    category_id: 'ba452b18-0442-5d9d-b0b6-2f001f956f6d',
    files_hash: 'b27ae02f28eda2ef7e2b5ee925fdad06b3346617',
    type: 2,
  },
}

const exampleFilesOutput = {
  hdri: {
    '24k': {
      hdr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/16k%2B/sunset_jhbcentral_24k.hdr',
        size: 756147661,
        md5: 'b1438b8dd1ca53a91944e3367e175158',
      },
      exr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/16k%2B/sunset_jhbcentral_24k.exr',
        size: 526001961,
        md5: 'fb83316d5976bf653f3923cf5bc44bef',
      },
    },
    '16k': {
      hdr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/16k%2B/sunset_jhbcentral_16k.hdr',
        size: 345415797,
        md5: '4a56bb47f70a2a15e7404314692b199c',
      },
      exr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/16k%2B/sunset_jhbcentral_16k.exr',
        size: 219943475,
        md5: 'c29c2cf7760898b84997f2fa6b3694bf',
      },
    },
    '8k': {
      hdr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/8k/sunset_jhbcentral_8k.hdr',
        size: 93730967,
        md5: 'e7cbbfcce30ce165b74824faedef9a74',
      },
      exr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/8k/sunset_jhbcentral_8k.exr',
        size: 67577270,
        md5: '6ed3db3510a23a7c289ba4f06c1a3ee3',
      },
    },
    '4k': {
      hdr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/sunset_jhbcentral_4k.hdr',
        size: 23911312,
        md5: '20a622af5c6bd9a1e8a3ea7ee749627b',
      },
      exr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/4k/sunset_jhbcentral_4k.exr',
        size: 18180266,
        md5: 'e8921153d623e5557e4035563177d296',
      },
    },
    '2k': {
      hdr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/sunset_jhbcentral_2k.hdr',
        size: 6099369,
        md5: '0bce4fab7ab46f2db6846ee013cb54fc',
      },
      exr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/2k/sunset_jhbcentral_2k.exr',
        size: 4954192,
        md5: 'f1a05bd78e430b5ed1bdc997db3020ea',
      },
    },
    '1k': {
      hdr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/sunset_jhbcentral_1k.hdr',
        size: 1573705,
        md5: '97335a81ba615beb6f6ae0da707ecd75',
      },
      exr: {
        url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/1k/sunset_jhbcentral_1k.exr',
        size: 1345757,
        md5: '4d30d85f563fc0e78f74f203494d6946',
      },
    },
  },
  tonemapped: {
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/sunset_jhbcentral.jpg',
    size: 31418988,
    md5: '4843bff2861e9c04185402da8ba0c97a',
  },
  colorchart: {
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Color%20Charts/sunset_jhbcentral.zip',
    size: 60241853,
    md5: '698abc26d1b81986998ccb9645f8fd77',
  },
}

const APIPage = () => {
  return (
    <TextPage title="API" description="About Poly Haven's public API" url="/our-api">
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Poly Haven API</h1>
        <InfoBox
          type="info"
          header="The Poly Haven API is now free for everyone - including commercial use."
          icon={<MdCampaign />}
        >
          <p>
            The assets have always been CC0, and now the API that serves them is open the same way. If you build
            something on our live API, all we ask is that it's clear to your users that the assets came from Poly Haven
            :)
          </p>
          <p>
            If this is useful to you, consider supporting us on{' '}
            <a href="https://www.patreon.com/polyhaven/join?cadence=12">Patreon</a>.
          </p>
          <p>
            -Greg
            <br />
            <em style={{ opacity: 0.5 }}>18 July 2026</em>
          </p>
        </InfoBox>
        <div className={styles.columns} style={{ marginTop: '2rem' }}>
          <div>
            <p className={styles.columnLabel}>
              <code>GET /assets</code> - list &amp; metadata
            </p>
            <CodeBlock lang="curl" code={EXAMPLE_CURL} />
            <div style={{ height: '0.3rem' }} />
            <CodeBlock lang="json" code={exampleAPIOutput} scrollable showTypeComments />
          </div>
          <div>
            <p className={styles.columnLabel}>
              <code>GET /files/&#123;id&#125;</code> - download links
            </p>
            <CodeBlock lang="curl" code={EXAMPLE_FILES_CURL} />
            <div style={{ height: '0.3rem' }} />
            <CodeBlock lang="json" code={exampleFilesOutput} scrollable />
          </div>
        </div>
        <div className={styles.row} style={{ justifyContent: 'flex-end' }}>
          <Button color="hollow" text="Status" href="https://status.polyhaven.org/795376312" />
          <Button
            color="hollow"
            text="API Terms of Service"
            href="https://github.com/Poly-Haven/Public-API/blob/master/ToS.md"
          />
          <Button
            text="View API Documentation"
            href="https://redocly.github.io/redoc/?url=https://api.polyhaven.com/api-docs/swagger.json&nocors"
          />
        </div>
        <p>
          We host a public API (<a href="https://api.polyhaven.com">https://api.polyhaven.com</a>) that can be used to
          access and download our assets, with a few conditions.
        </p>
        <h2>What can I do with the API?</h2>
        <p>
          We encourage you to use the API to integrate our assets into your tool/software, or to bulk-download the
          dataset for research purposes.
        </p>
        <p>Example use cases we know about:</p>
        <ul>
          <li>Third-party asset browsers and game engine importers that let people drag-and-drop our assets in-app.</li>
          <li>
            Bulk-downloading for academic research or training data for AI/ML pipelines that need clean, human-made,
            CC0-licensed resources.
          </li>
          <li>
            Internal asset-management tools and pipelines at studios that depend on the library day-to-day in
            production.
          </li>
          <li>
            Our own <Link href="/plugins/blender">Blender Add-on</Link> and{' '}
            <Link href="/plugins/unreal">Unreal HDRI Browser</Link>, which pull assets directly into your scene without
            visiting the website.
          </li>
        </ul>
        <p>
          You should read the full{' '}
          <a href="https://github.com/Poly-Haven/Public-API/blob/master/ToS.md">Terms of Service</a> of the API, but in
          summary:
        </p>

        <h3>1. ✅ The API is free to use, for any purpose</h3>
        <p>
          Personal, academic, or commercial. There's no premium tier, no revenue share, and no login or API key required
          for the default endpoints.
        </p>
        <p>
          It is a public API for the public benefit. Consider supporting us on{' '}
          <Link href="https://www.patreon.com/polyhaven/join?cadence=12">Patreon</Link> if you find it useful!
        </p>

        <h3>2. ⚠️ Attribution required</h3>
        <p>
          If you use the live API in your product, website, or service, make it clear to your users that the assets came
          from Poly Haven.
        </p>
        <p>
          Any clear credit works for this - labelling it in your interface (a title, menu item, or button that names
          Poly Haven) is great, and so is a small{' '}
          <strong>
            <em>"Powered by Poly Haven"</em>
          </strong>{' '}
          credit near the content if that fits your product better. Feel free to use our <Link href="/logo">logo</Link>{' '}
          if it helps.
        </p>
        <p>
          This is a condition of using the live API service, not of the assets themselves: the assets are{' '}
          <Link href="/license">CC0</Link>.
        </p>

        <h3>3. ⚠️ Unique User-Agent required</h3>
        <p>
          All requests to the API require a <strong>unique User-Agent</strong> header, such as your application name, so
          that we may track your usage.
        </p>
        <p>For example:</p>
        <CodeBlock lang="curl" code={EXAMPLE_CURL} />
        <hr />
        <h2>Best effort</h2>
        <p>
          We primarily maintain the API for our own purposes and may occasionally change endpoints and authentication
          methods. If you are integrating our API in your tool on the user side, please{' '}
          <Link href="/about-contact">contact us</Link> so that we are aware of it and can notify you of any relevant
          changes.
        </p>
        <p>We also love hearing about how you are using the API ❤️</p>
        <p>
          If your company depends heavily on the API in production, you're welcome to help fund the operational side of
          things - such as a signed Provenance Attestation or a Bulk Snapshot - via{' '}
          <Link href="/corporate">our corporate page</Link>. This is entirely optional and never required to use the
          API.
        </p>
        <p>
          See our status page for uptime stats:{' '}
          <a href="https://status.polyhaven.org/795376312">https://status.polyhaven.org</a>
        </p>
        <h2>What's in it?</h2>
        <p>
          Check the{' '}
          <a href="https://redocly.github.io/redoc/?url=https://api.polyhaven.com/api-docs/swagger.json&nocors">
            full documentation
          </a>{' '}
          for a list of endpoints and examples. In a nutshell, the API includes:
        </p>
        <ul>
          <li>A list of all assets.</li>
          <li>Information and metadata about each asset, such as tags and categories, authors, dimensions, etc.</li>
          <li>Download URLs, hashes and file sizes of all asset files.</li>
          <li>
            For files with dependencies (e.g. Blend/USD needs the image texture files), a list of the required files and
            their URLs.
          </li>
        </ul>
        <p>In short, the API includes everything you need to browse and download our assets.</p>
      </div>
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default APIPage
