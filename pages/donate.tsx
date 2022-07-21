import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

import TextPage from 'components/Layout/TextPage/TextPage'
import Button from 'components/Button/Button';

const Page = () => {
  return (
    <TextPage
      title="Once-off Donation"
      description="How to make a once-off donation to Poly Haven."
      url="/donate"
    >
      <h1>Make a once-off donation</h1>
      <p>
        Before making a one-time donation, please understand the two reasons why we prefer using <a href="https://www.patreon.com/polyhaven/overview">Patreon</a> instead:
      </p>
      <ol>
        <li>Tax regulations in our country require a small amount of paperwork and manual processing to receive individual donations. If the donation is small, it may cost us more in accounting fees to process your donation than we actually receive.</li>
        <li>In order to be a sustainable open project, we need a <Link href="/finance-reports">predictable budget</Link>. Having a wildly varying income makes it difficult for us to plan ahead and hire staff long term. We would mych prefer you to donate a small monthly amount over a long term than a single lump sum, even if the lump sum would be higher in the end.</li>
      </ol>
      <h2>Donations under $20</h2>
      <p>Please join us temporarily on <a href="https://www.patreon.com/polyhaven/overview">Patreon</a>, wait until the end of the month when your payment is made, and then cancel your account.</p>
      <h2>Larger donations</h2>
      <p>To make a one-time donation, please use either PayPal or Ko-fi:</p>
      <Button text="Donate on PayPal" href="https://paypal.me/polyhaven" />
      <Button text="Donate on Ko-fi" href="https://ko-fi.com/polyhaven" />
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}

export default Page