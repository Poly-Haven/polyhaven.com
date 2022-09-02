import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';

import { MdDescription, MdUnarchive } from 'react-icons/md';

import Button from 'components/UI/Button/Button';
import TextPage from 'components/Layout/TextPage/TextPage'

const Contribute = () => {
  return (
    <TextPage
      title="Contribute"
      description="How to contribute your own 3D asset to Poly Haven."
      url="/contribute"
    >
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Donate Your 3D Asset to Poly Haven</h1>
        <p>Have a top-notch 3D model/texture/hdri you'd like to publish on Poly Haven? We'd be happy to check it out :)</p>
        <p>We do have a very high standard of quality and some strict legal requirements - please read the following before submitting your asset:</p>

        <hr />

        <h2>Important</h2>

        <p>Your asset must be <strong>100% your own original work.</strong></p>
        <p>By sending us your asset, you will be releasing it under the <Link href="/license">CC0 license</Link>, forfeiting your copyright.</p>

        <p>Once we upload it to Poly Haven, anyone will be able to do anything they want with your asset, which is awesome and really generous of you, but it's important you understand that and know that it <strong>cannot be revoked</strong>. Once you declare something as CC0, it's in the public domain forever and cannot ever be made private again.</p>

        <p><strong>You cannot include any copyrighted materials in your asset</strong> such as textures that you didn't make yourself, unless you have explicit permission to redistribute derivative work as CC0, or the textures are CC0 themselves.</p>

        <p>If your asset includes any real-world logo, trademark, or copyrighted design, we cannot accept it.</p>

        <p>Similarly, if your asset is a digital copy of another design that you didn't make (e.g. real-world firearms, furniture, etc.), or based on someone else's concept art, we cannot publish it.</p>

        <p>Once your asset is approved, you'll be signing a legal agreement to confirm all of this and providing proof of authorship.</p>

        <hr />

        <h2>Requirements</h2>

        <p>Quality over quantity is key on the internet these days, so unfortunately that means we have to be very strict about reviewing your asset in order to maintain a high standard of quality on Poly Haven.</p>

        <p>Feel free to chat to us on <Link href="https://discord.gg/Dms7Mrs">Discord</Link> if you're not sure the quality of your asset is high enough. We may be able to provide some feedback, or help you work on it.</p>

        <h4>Requirements for 3D models:</h4>

        <ul>
          <li>Photorealistic, suitable for next-gen game engines and visual effects.</li>
          <li>Fully UV unwrapped and textured with standard PBR maps. If you have a complex procedural shader, this should be baked down to a simple set of images.</li>
          <li>Minimum 4k resolution textures, preferably 8k.</li>
          <li>In real-world scale.</li>
          <li>Uses only custom original textures, or textures that are CC0/public domain.</li>
          <li>In either ".blend" format, or a format we can import into Blender (fbx, gltf, etc.).</li>
          <li>For reference, here's <a href="https://blog.polyhaven.com/simple-prop-workflow/">how we make high quality 3D models</a>.</li>
          <li>If you'd like to make our lives easier and get your asset published more quickly, please check out our <a href="https://docs.google.com/document/d/17vLGfCbouvwcp1mcbsMe892DB0QkGLoR3gSjLtsVTGM/edit?usp=sharing">technical standards document</a>.</li>
        </ul>

        <h4>Requirements for Textures:</h4>

        <ul>
          <li>Created using photoscanning/photogrammetry.</li>
          <li>Full set of standard PBR maps - diffuse/albedo, roughness, metalness (if applicable), displacement, normal - not just a single image.</li>
          <li>Seamless/tileable on at least one axis.</li>
          <li>Minimum 8k resolution.</li>
          <li>As 16-bit PNGs.</li>
          <li>For reference, here's <a href="https://blog.polyhaven.com/photoscanned-texture-creation-process/">how we make high quality textures</a>.</li>
        </ul>

        <h4>Requirements for HDRIs:</h4>

        <ul>
          <li>Photo-based, no virtual scenes.</li>
          <li>Created with a <a href="https://blog.polyhaven.com/how-to-create-high-quality-hdri/">fully linear workflow</a>. No tonemapping, color/contrast adjustments, sharpening, or tone curve.</li>
          <li><a href="https://blog.polyhaven.com/what-is-clipping/">Unclipped</a> (complete dynamic range).</li>
          <li>Minimum 16k resolution.</li>
          <li>Separate macbeth color chart shot parallel to the ground, with the same exposure bracket as the rest of the pano, and merged to HDR file in the same way. Raw files (plus HDR) required.</li>
          <li>No avoidable or significant lens flares, stitching seams, or motion/depth blur.</li>
          <li>No recognizable people. If you can't mask them out or remove them, their faces need to be obscured.</li>
          <li>Tripod & shadow removed from bottom.</li>
          <li>If you want to include backplates, there are more requirements for these, <Link href="/about-contact">please get in touch</Link> :)</li>
          <li>For reference, here's <a href="https://blog.polyhaven.com/how-to-create-high-quality-hdri/">how we make high quality HDRIs</a>.</li>
        </ul>

        <hr />

        <h2>Is there payment for this?</h2>

        <p>No, sorry. We have a very limitted budget which we need to use to support our staff to work on our own assets. However, when we hire artists to create new content, donors like you are the first people we look at.</p>

        <p>This may change in future, but for now it's simply a selfless donation to the community.</p>

        <p>If we publish your asset, you obviously receive full credit, and we can optionally include a link to your PayPal/Patreon/Ko-fi account in case someone wants to donate to you directly.</p>

        <hr />

        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '1em' }}>
          <h2 style={{ margin: 0 }}>Ready to donate?</h2>
          <Button text="Submit your asset!" icon={<MdUnarchive />} href="https://forms.gle/jvaKUR6KPcVfhLiU6" />
        </div>

      </div>
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

export default Contribute