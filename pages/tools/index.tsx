import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import Blender from 'components/UI/Icons/Blender'
import Button from 'components/UI/Button/Button'

import TextPage from 'components/Layout/TextPage/TextPage'

const Tool = ({ name, icon, description, link }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        border: '1px solid rgba(255,255,255, 0.1)',
        background: 'rgba(255,255,255, 0.02)',
        boxShadow: '2px 2px 9px -2px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div style={{ fontSize: '2em', flexShrink: 0 }}>{icon}</div>
      <div style={{ flexGrow: 1 }}>
        <h2 style={{ margin: 0 }}>{name}</h2>
        <p>{description}</p>
      </div>
      <Button href={link} text="Learn more" style={{ flexShrink: 0 }} />
    </div>
  )
}

const ToolsPage = () => {
  return (
    <TextPage
      title="Tools"
      description="Programs, software, plugins and other projects we make for or alongside Poly Haven."
      url="/tools"
    >
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Poly Haven Tools</h1>
        <p>Programs, software, plugins and other projects we make for or alongside Poly Haven.</p>

        <section>
          <h2>Asset Plugins/Add-ons</h2>
          <p>Get our assets directly in your 3D software:</p>
          <Tool
            name="Blender Add-on"
            icon={<Blender />}
            description="Pulls all our assets into Blender's asset browser, making it easy for you to drag and drop HDRIs, materials and 3D models into your scene without having to visit the website."
            link="/plugins/blender"
          />
        </section>

        <section>
          <h2>Other Tools</h2>
          <p>Other things we made that help us run Poly Haven:</p>
          <Tool
            name="imgvwr"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/imgvwr.png?height=32" />}
            description="A fast, minimal, but highly capable viewer for HDRIs and images of any kind."
            link="https://github.com/Poly-Haven/imgvwr"
          />
          <Tool
            name="HDR Merge Master"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/hdr-merge-master.png?height=32" />}
            description="What we use to merge exposure brackets into reliable linear 32-bit EXRs in the process of making HDRIs."
            link="https://github.com/gregzaal/HDR-Merge-Master"
          />
          <Tool
            name="Bracket Buddy"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/bracket-buddy.png?height=32" />}
            description="An HDRI companion mobile app to help calculate your HDR exposure bracket sequences."
            link="https://github.com/Poly-Haven/BracketBuddy"
          />
          <Tool
            name="panoverlay"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/panoverlay.jpg?height=32&sharpen=true" />}
            description="Augmentations for PTGui to assist in stitching difficult panoramas."
            link="https://github.com/Poly-Haven/panoverlay"
          />
          <Tool
            name="Gaffer"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/gaffer.jpg?height=32&sharpen=true" />}
            description="A light and HDRI manager add-on for Blender."
            link="https://superhivemarket.com/products/gaffer-light-manager"
          />
          <Tool
            name="Matalogue"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/matalogue.png?height=32" />}
            description="A Blender add-on that displays a list of materials & node trees in the toolbar of the Node Editor."
            link="https://extensions.blender.org/add-ons/matalogue/"
          />
          <Tool
            name="Manage File Paths"
            icon={
              <img src="https://cdn.polyhaven.com/site_images/icons/manage-file-paths.png?height=32&sharpen=true" />
            }
            description="A Blender add-on that lists all image and cache file paths in your project."
            link="https://github.com/gregzaal/manage-file-paths"
          />
        </section>

        <section>
          <h2>But wait, there's more!</h2>
          <p>Things that are tangentially related to Poly Haven that we also maintain:</p>
          <Tool
            name="Compact Screen Ruler"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/screenruler.png?height=32" />}
            description="A minimal frameless ruler for measuring distances on your screen. Also takes screenshots."
            link="https://github.com/gregzaal/Compact-Screen-Ruler"
          />
          <Tool
            name="Auto-Voice-Channels"
            icon={<img src="https://cdn.polyhaven.com/site_images/icons/auto_voice_channels_T.png?height=32" />}
            description="A Discord bot that creates voice channels dynamically with naming templates."
            link="https://auto-voice.io"
          />
        </section>
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

export default ToolsPage
