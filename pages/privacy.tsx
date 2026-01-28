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

        <h2>Google Account Login (Firebase Authentication)</h2>
        <p>
          We allow users to create an account and log in using their Google account through Firebase Authentication.
          When you choose to sign in with Google, we receive limited profile information provided by Google.
        </p>
        <p>
          <strong>Data accessed:</strong> This includes your email address, display name, profile photo (if available),
          and a unique Google account identifier.
        </p>
        <p>
          <strong>How we use this data:</strong> This information is used solely to authenticate you, create and manage
          your user account, and associate uploaded or shared files with your account.
        </p>
        <p>
          <strong>Storage and retention:</strong> This data is stored securely within our Firebase project and is
          retained only for as long as your account remains active.
        </p>
        <p>
          <strong>Data sharing:</strong> We do not sell, rent, or share Google user data with third parties, except
          where necessary to operate the service (for example, Firebase authentication and hosting infrastructure).
        </p>
        <p>
          <strong>Data deletion:</strong> You may request deletion of your account and associated data at any time. Once
          deleted, all Google account data associated with your account is permanently removed from our systems.
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
