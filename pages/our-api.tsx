import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'

import TextPage from 'components/Layout/TextPage/TextPage'

const APIPage = () => {
  return (
    <TextPage title="API" description="About Poly Haven's public API" url="/our-api">
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Poly Haven API</h1>

        <p>
          We host a public API (<a href="https://api.polyhaven.com">https://api.polyhaven.com</a>) that can be used to
          access and download our assets, with a few conditions.
        </p>

        <h2>What can I do with the API?</h2>

        <p>
          We encourage you to use the API to integrate our assets into your tool/software, or to bulk-download the
          dataset for research purposes.
        </p>

        <p>
          You should read the full{' '}
          <a href="https://github.com/Poly-Haven/Public-API/blob/master/ToS.md">Terms of Service</a> of the API, but in
          summary:
        </p>

        <ol>
          <li>
            ✅ The API is <strong>free to use for non-commercial</strong> projects and academic research.
          </li>
          <li>
            ⚠️ <strong>Commercial usage</strong> of the API requires a custom license, and typically{' '}
            <Link href="/corporate">sponsorship</Link>. Please <Link href="/about-contact">contact us</Link> to discuss
            your use case.
          </li>
          <li>
            ⚠️ All requests to the API require a <strong>unique User-Agent</strong> header, such as your application
            name, so that we may track your usage. While most of the API will work temporarily without this User-Agent
            header, eventually requests without one will be blocked.
          </li>
        </ol>

        <p>
          We primarily maintain the API for our own purposes and may occasionally change endpoints and authentication
          methods. If you are integrating our API in your tool on the user side, please{' '}
          <Link href="/about-contact">contact us</Link> so that we are aware of it and can notify you of any relevant
          changes.
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
