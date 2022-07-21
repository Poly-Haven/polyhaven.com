import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

import TextPage from 'components/Layout/TextPage/TextPage'

const LicensePage = () => {
  return (
    <TextPage
      title="License"
      description="CC0 means absolute freedom."
      url="/license"
    >
      <h1>Asset License</h1>
      <p>All assets (<Link href="/hdris">HDRIs</Link>, <Link href="/textures">textures</Link> and <Link href="/models">3D models</Link>) on this site are the original work of Poly Haven staff, or artists who willingly and directly donate/sell their work to Poly Haven.</p>
      <p>Our assets are all licensed as <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0</a>, which is effectively <a href="https://en.wikipedia.org/wiki/Public_domain">Public Domain</a> even in jurisdictions that do not support the Public Domain.</p>
      <p>Here's an excerpt from the <a href="https://wiki.creativecommons.org/wiki/CC0_FAQ">CC0 FAQ page</a> to clarify:</p>
      <q>Once the creator or a subsequent owner of a work applies CC0 to a work, the work is no longer his or hers in any meaningful sense under copyright law. Anyone can then use the work in any way and for any purpose, including commercial purposes [...] Think of CC0 as the "no rights reserved" option. CC0 is a useful tool for clarifying that you do not claim copyright in a work anywhere in the world.</q>
      <p>In other words:</p>
      <ul>
        <li><b>You can use our assets for any purpose</b>, including commercial work.</li>
        <li><b>You do not need to give credit</b> or attribution when using them (although it is appreciated).</li>
        <li><b>You can redistribute them</b>, share them around, include them when sharing your own work, or even in a product you sell.</li>
      </ul>
      <p>More info: <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 summary</a>, <a href="https://wiki.creativecommons.org/wiki/CC0">CC0 wiki</a>, <a href="https://wiki.creativecommons.org/wiki/CC0_FAQ">CC0 FAQ</a>.</p>
      <h1>Why CC0?</h1>
      <p>We believe the benefits of using this license outweigh the obvious drawbacks for us as a business.</p>
      <p>Yes it's possible that unethical users can (and do) resell our work for their own profit, at the cost of unwitting customers who didn't know they were purchasing content they could get here for free.</p>
      <p>But what the 3D industry as a whole gains from our work being so freely available is immeasurable.</p>
      <p>3D art is also only the tip of the iceberg, we've heard from numerous data scientists, software developers, automotive engineers and AI researchers all using our assets in their work, which simply wouldn't be possible with more restrictive (even open source) licenses.</p>
      <p>We don't have anything against Copyright in general, we simply believe we can do more good in the world by providing as much freedom as possible.</p>
      <p>If you benefit from our work financially, e.g. by including our assets in a product you sell, or simply make frequent use of them in your own work, please consider <Link href="https://www.patreon.com/polyhaven/overview">supporting us on Patreon</Link> with a small monthly donation in order to help us continue to produce more assets and maintain this platform.</p>
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

export default LicensePage