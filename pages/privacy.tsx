import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'

import TextPage from 'components/Layout/TextPage/TextPage'

const PrivacyPage = () => {
  return (
    <TextPage
      title="Privacy Policy"
      description="Read our Privacy Policy, including information about third party services."
      url="/privacy"
    >
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Privacy Policy</h1>

        <h2>UUID</h2>
        <p>
          When you first visit this site and accept the Cookie popup, we store a unique random identifier in your
          browser, which is sent to us when you download an asset (along with some information about the resolution and
          formats you downloaded). This helps us to see which assets are more popular and what people are generally
          looking for, so we can make decisions about what to create next.
        </p>
        <p>If you wish for us to delete all recorded downloads from your UUID, you can contact us.</p>

        <h2>Download Preferences</h2>
        <p>
          If you customize the resolution or format options when downloading an asset, this information is stored
          permanently in your browser so that it can be used again for subsequent downloads to save you time.
        </p>

        <h2>Patron Names in Footer</h2>
        <p>
          The user names of all active supporters on <a href="https://www.patreon.com/polyhaven/overview">Patreon</a>{' '}
          are automatically shown in the footer of every page on this site.
        </p>
        <p>The 30 newest patrons are also shown on the home page.</p>
        <p>
          If you would like your name removed, you can visit your <Link href="/account">account page</Link> and disable
          the <strong>Footer Credit</strong> visibility.
        </p>

        <hr />

        <p>Other than what's mentioned above, Poly Haven does not store any user data or cookies.</p>
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

export default PrivacyPage
