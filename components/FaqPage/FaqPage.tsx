import { useState, useEffect } from 'react';
import Link from 'next/link';

import useQuery from 'hooks/useQuery';

import FaqItem from './FaqItem'

import styles from './FaqPage.module.scss'

const FaqPage = () => {
  const [clicked, setClicked] = useState("")
  const query = useQuery();

  useEffect(() => {
    if (query && query.q) {
      const qID = `${query.q}`
      setClicked(qID)
      document.querySelector(`#${qID}`).scrollIntoView({ behavior: 'smooth' })
    }
  }, [query])

  return (
    <div>
      <h1>Frequently Asked Questions</h1>
      <FaqItem question="Can I use these assets commercially?" activeQ={clicked} qID="commercial">
        <p>Yes. All our assets are released under the CC0 license, meaning you can use them for absolutely any purpose, including commercial work. <Link href="/license">More about CC0 here</Link>.</p>
      </FaqItem>
      <FaqItem question="Can I include these assets in a product I sell?" activeQ={clicked} qID="sell">
        <p>Yes. The only thing you can't do is claim to be the <em>original</em> author or re-license them. <Link href="/license">More about the CC0 license here</Link>.</p>
        <p>Please make it clear to your customers that these assets are free and public domain, and if possible include a link to Poly Haven.</p>
        <p>If your product sells well, consider supporting the creation of these assets <a href="https://www.patreon.com/polyhaven/overview">on Patreon</a>.</p>
      </FaqItem>
      <FaqItem question="Do you do commissions?" activeQ={clicked} qID="commissions">
        <p>Poly Haven does not itself do commissions, but our artists may be happy to work with you. Please <Link href="/about-contact">get in touch</Link> and we can point you in the right direction.</p>
        <p>
          Often we offer discounts if you allow us to publish your assets on Poly Haven too.
        </p>
      </FaqItem>
      <FaqItem question="How is this funded?" activeQ={clicked} qID="funding">
        <p>In short, donations from people like you, corporate sponsors, and advertising.</p>
        <p>We publish the details of how we work financially in our <Link href="/finance-reports">public finance reports</Link>.</p>
      </FaqItem>
      <FaqItem question="What is an HDRI anyway?" activeQ={clicked} qID="what-is-an-hdri">
        <p>Generally speaking, an HDRI (High Dynamic Range Image) is simply an image that contains more than 8 bits of data per pixel per channel. Image formats like JPG and PNG are typically 8-bit and are sometimes referred to as 'LDR' (Low Dynamic Range) images, whereas image formats like <a href="https://en.wikipedia.org/wiki/OpenEXR">EXR</a> and <a href="https://en.wikipedia.org/wiki/RGBE_image_format">HDR</a> store more data and are therefore HDRIs.</p>
        <p>However in the CG world (and on this site) we have come to use the term 'HDRI' to describe a 32-bit 360x180 degree <a href="https://en.wikipedia.org/wiki/Equirectangular_projection">equirectangular</a> image that is used for lighting CG scenes.</p>
        <p>HDRIs are often used as the only light source in order to create a very realistically lit scene, or to match the lighting from video footage (using an HDRI shot on the same set as the video was taken). But of course they are also used to compliment standard lighting techniques and to add detail to reflections.</p>
      </FaqItem>
      <FaqItem question="How do I use your HDRIs?" activeQ={clicked} qID="use-hdri">
        <p>It's super easy, and no different from using any other HDRI. Here are some short videos to show you exactly how:</p>
        <ol>
          <li><a href="https://www.youtube.com/watch?v=Pi4Ft7M8UOU">Blender + Cycles</a></li>
          <li><a href="https://www.youtube.com/watch?v=riBa2YWfajc">3ds Max + Corona</a></li>
        </ol>
        <p>All our HDRIs are unclipped, meaning you'll get realistic results automatically and do not need to adjust the gamma or plug the image into the strength/intensity input.</p>
      </FaqItem>
      <FaqItem question="How do you measure the dynamic range (EVs) of an HDRI?" activeQ={clicked} qID="evs">
        <p>The number of EVs (or 'stops') is based purely on the number of brackets captured. For example, 12 EVs means 5 photos were taken with 3 EVs between them (shutter speeds: 1/4000, 1/500, 1/60 1/8, 1"), and since there are 4 gaps of 3 EVs between them, the dynamic range is said to be 12 EVs (4x3=12).</p>
        <p>Unfortunately there is no standardized way for measuring the dynamic range of an HDRI. Different people use different methods, so there's no reliable way that you as a user can tell whether website-A that claims 50 EVs of dynamic range is actually better than website-B that has 20 EVs.</p>
        <p>The main thing to look out for is whether an HDRI is <a href="http://blog.polyhaven.com/what-is-clipping/">unclipped</a> or not. They usually don't mention anything if it is indeed clipped, so watch out. Being unclipped means the <strong>full range of brightness in the scene</strong> was captured, including the super crazy bright sunshine. If an HDRI is clipped (aka "clamped"), it will produce unrealistic lighting which is usually flat and lacking contrast.</p>
      </FaqItem>
      <FaqItem question="What equipment/software do you use for HDRIs?" activeQ={clicked} qID="camera">
        <p>This changes every now and then, and there are now multiple photographers shooting HDRIs for this site, so take a look at my article on <a href="https://blog.polyhaven.com/how-to-create-high-quality-hdri/">creating your own HDRIs</a> to answer your actual question ;)</p>
      </FaqItem>
      <FaqItem question="Why do your diffuse maps lack any form of shading?" activeQ={clicked} qID="albedo">
        <p>These diffuse textures are actually albedo maps, designed for use in physically-based rendering engines. We use the term "diffuse" instead because it's a little more widely understood than "albedo", and a little more specific than "color".</p>
        <p>For PBR rendering to look correct, albedo maps shouldn't contain any shading. Instead, shading is applied by the rendering engine itself, with the help of physical geometry displacement and path traced shading, or a separate ambient occlusion map. Without real micro-displacement geometry, the separate ambient occlusion map can be used to simulate the effect that the real geometry would have on the shading in an average environment, typically only applied to indirect lighting.</p>
        <p>This is why we remove as much shading from our diffuse maps as possible, though we can't always remove everything, and in some cases it's desirable to leave in microscopic shading which would not be reproduced by shading real geometry displacement anyway.</p>
        <p>By contrast, diffuse maps used in older or non-photorealistic rendering engines are intended to contain shading. If you are working with such a rendering engine, or if you wish to reduce the distribution file size of your project, you can merge the albedo and AO maps together to create a traditional diffuse map. This can be done by multiplying the AO map over the albedo map in an image editor.</p>
      </FaqItem>
      <FaqItem question="Can I upload my own models/textures/hdris?" activeQ={clicked} qID="upload">
        <p>Maybe!</p>
        <p>We're not trying to be the next BlendSwap or Turbosquid, but we do accept donated assets that meet our strict quality standards.</p>
        <p><Link href="/contribute">Find out how to submit your asset here</Link>.</p>
      </FaqItem>
      <FaqItem question="Do you use Photogrammetry/Photoscanning?" activeQ={clicked} qID="photoscanning">
        <p>Absolutely, but remember this is just one of the many tools available. Our goal is to create quality assets, and we'll use whatever methods are best for each case.</p>
      </FaqItem>
      <FaqItem question="Where did the gun models go?" activeQ={clicked} qID="guns">
        <p>When we launched 3D Model Haven in 2020, we commissioned a few gun models from various authors to publish there. These have now been removed, as we assume their creators based their work off of real-world gun designs, which is likely the intellectual property of the manufacturers.</p>
        <p>This is a legal grey area we'd rather avoid - the models themselves are CC0, but the designs they may be based off of probably aren't - so it's safer for everyone if we just remove them from the site.</p>
        <p>In future we plan to replace them with models based on original fictional designs.</p>
      </FaqItem>
    </div>
  )
}

export default FaqPage
