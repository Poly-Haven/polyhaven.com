import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'

import Blender from 'components/UI/Icons/Blender'
import Unreal from 'components/UI/Icons/Unreal'
import Button from 'components/UI/Button/Button'

import TextPage from 'components/Layout/TextPage/TextPage'

const Plugin = ({ name, icon, description, link }) => {
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

const PluginsPage = () => {
  return (
    <TextPage title="Poly Haven Plugins/Add-ons" description="" url="/plugins">
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Poly Haven Plugins/Add-ons</h1>

        <p>Currently we have two plugins available to integrate our assets directly into your 3D software:</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '2em 0' }}>
          <Plugin
            name="Blender Add-on"
            icon={<Blender />}
            description="Pulls all our assets into Blender's asset browser, making it easy for you to drag and drop HDRIs, materials and 3D models into your scene without having to visit the website."
            link="/plugins/blender"
          />
          <Plugin
            name="Unreal HDRI Browser"
            icon={<Unreal />}
            description="A plugin for UE5 that allows you to browse and import HDRIs directly into your projects."
            link="/plugins/unreal"
          />
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
  }
}

export default PluginsPage
