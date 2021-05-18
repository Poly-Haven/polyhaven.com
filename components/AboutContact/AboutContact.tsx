import Link from 'next/link';

import Staff from 'components/Avatar/Staff'
import CorporateSponsors from 'components/CorporateSponsors/CorporateSponsors'

import styles from './AboutContact.module.scss'

const AboutPage = () => {
  return (
    <div>
      <div className={styles.intro}>
        <img src='/Logo 256.png' className={styles.logo} />
        <div className={styles.text}>
          <h1>Hi there!</h1>
          <p>Poly Haven is a curated public asset library for visual effects artists and game designers, providing useful high quality 3D assets in an easily obtainable manner.</p>
          <p>There are no paywalls, accounts or email forms required, just download an asset and use it without worry.</p>
          <p>All assets here are <Link href="/license"><a>CC0</a></Link>, which means they're practically free of copyright and you may use them for absolutely any purpose.</p>
          <p></p>
        </div>
      </div>

      <div className={styles.staff}>
        <Staff id="Greg Zaal" name="Greg Zaal" role="Director, HDRIs" country="ZA" mode="full" />
        <Staff id="Rob Tuytel" name="Rob Tuytel" role="Co-founder, Textures" country="NL" mode="full" />
        <Staff id="Rico Cilliers" name="Rico Cilliers" role="Models, Textures" country="ZA" mode="full" />
        <Staff id="James Ray Cock" name="James Ray Cock" role="Models" country="ZA" mode="full" />
        <Staff id="Andreas Mischok" name="Andreas Mischok" role="HDRIs" country="DE" mode="full" />
        <Staff id="Sergej Majboroda" name="Sergej Majboroda" role="HDRIs" country="UL" mode="full" />
      </div>

      <CorporateSponsors header="Corporate Sponsors:" />

      <h1>Why are we doing this?</h1>
      <p>Because we can!</p>
      <p>And because we believe we can help the greater 3D community grow by providing our assets for free rather than selling them.</p>
      <p>We want to lower the barrier of entry for new artists, remove financial barriers, and make it easier for experienced artists to focus on creativity rather than re-inventing the wheel for every prop they need.</p>

      <h1>How are we doing this?</h1>
      <p>We're a small remote studio based in South Africa, working with creators around the world who share our vision.</p>
      <p>Funding-wise, we're supported primarily by donations from people like you on <Link href="https://www.patreon.com/hdrihaven/overview"><a>Patreon</a></Link>, advertising revenue, and corporate sponsors who believe they can benefit from supporting our work in the long term.</p>
      <p>For the creation of assets, there are three sources:</p>
      <ol>
        <li>Artists employed by Poly Haven, focusing on the big picture.</li>
        <li>Independent contractors we hire, tasked with specific projects.</li>
        <li>Users who freely donate their work to the platform.</li>
      </ol>

      <h1>Transparency</h1>
      <p>Since the majority of our funding comes from donations, it's important to us that anyone can see what we're up to, what we're planning, and the reasoning behind all of our decisions.</p>
      <p>Sharing our assets is our priority, but we also want to share our knowledge, so that others might learn how to create assets like ours and perhaps share them as well.</p>
      <ul>
        <li>We write regular Dev Logs on <a href="https://blog.hdrihaven.com/">our blog</a> to share what we've been working on recently.</li>
        <li>Our <a href="https://www.patreon.com/hdrihaven/posts?public=true">posts on Patreon</a> are also a good place to find smaller updates and polls when we need help making decisions.</li>
        <li><a href="https://discord.gg/Dms7Mrs">Discord</a> is where we hang out every day, feel free to say hi!</li>
        <li>Our social media is primarily automated for posting our latest assets, but we're occasionally active there too (links in the <a href="#social">footer</a>).</li>
        <li>Our <Link href="/finance-reports"><a>finance reports</a></Link> detail exactly how we spend or save our funds.</li>
      </ul>

      <h1>How you can help</h1>

      <h2>1. Support us on Patreon</h2>
      <p>If you have some disposable income and you want to help us publish more free HDRIs, textures and 3D models, you can support us with a small monthly donation on <Link href="https://www.patreon.com/hdrihaven/overview"><a>Patreon</a></Link> :)</p>
      <p>In return, we can give you some small token of thanks, like access to a cloud folder that you can sync to your hard drive so you always have our latest assets at your fingertips, or immortalize your name on our site.</p>
      <p>We use your donations directly to cover our expenses and fund new assets, as verified by our <Link href="/finance-reports"><a>finance reports</a></Link>.</p>

      <h2>2. Donate your assets</h2>
      <p>Have a top-notch 3D model, texture or HDRI you'd like to share with the community? We'd love to publish it for you :)</p>
      <p>We have a strict standard of quality to maintain, and everything we publish has to be <Link href="/license"><a>CC0</a></Link>, but if your asset is accepted the whole 3D community will benefit from it. <Link href="/contribute"><a>Read more and submit your asset here</a></Link>.</p>

      <h2>3. Spread the word</h2>
      <p>It's OK if you can't afford to, or don't want to donate to us :) You can still help us grow by making sure your friends and co-workers know about us, the more people we can help the better!</p>
      <p>It's not required at all, but if you use our assets in your work you can mention where you got them from and that'll help show more people that we exist.</p>

      <h1>Contact</h1>
      <p>Got a question? Please read the <Link href="/faq"><a>FAQ</a></Link> first :)</p>
      <p>The easiest ways to get hold of us is through email: <a href="mailto:info@polyhaven.com">info@polyhaven.com</a></p>

    </div>
  )
}

export default AboutPage