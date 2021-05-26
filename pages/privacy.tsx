import Link from 'next/link';

import TextPage from 'components/Layout/TextPage/TextPage'

const PrivacyPage = () => {
  return (
    <TextPage title="Privacy Policy">
      <h1>Privacy Policy</h1>

      <h2>Third Party Cookies</h2>
      <p>Third party vendors, including Google, use cookies to serve ads based on your prior visits to our website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our site and/or other sites on the Internet.</p>
      <p>Click here to read <a href="https://policies.google.com/technologies/partner-sites">Google's Privacy Policy</a>.</p>
      <p>If you are not comfortable with this, you can opt out of personalized advertising in your <a href="https://www.google.com/settings/ads">Ads Settings</a>, or use an ad-blocker such as <a href="https://github.com/gorhill/uBlock">uBlock Origin</a>.</p>

      <h2>IP Logging</h2>
      <p>When you download an asset, we log an anonymized version of your IP address, along with some information about the resolution and formats you downloaded. This helps us to see which assets are more popular and what people are generally looking for, so we can make decisions about what to create next.</p>
      <p>If you're not comfortable with this, you can use a VPN to obscure your public IP address. If you wish for us to delete all recorded downloads from your IP address, you can contact us.</p>

      <h2>Browser Storage</h2>
      <p>If you customize the resolution or format options when downloading an asset, this information is stored permanently in your browser so that it can be used again for subsequent downloads to save you time.</p>

      <h2>Patron Names in Footer</h2>
      <p>The user names of all active supporters on <a href="https://www.patreon.com/hdrihaven/overview">Patreon</a> are automatically shown in the footer of every page on this site.</p>
      <p>These names are publically accessibly on the Patreon website, but if you would like your name in the footer removed or changed, please contact me by direct message on Patreon.</p>

      <hr />

      <p>Other than what's mentioned above, Poly Haven does not store any user data or cookies.</p>
    </TextPage>
  )
}

export default PrivacyPage