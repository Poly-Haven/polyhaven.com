import TextPage from 'components/Layout/TextPage/TextPage'
import AboutContact from 'components/AboutContact/AboutContact'

const AboutPage = () => {
  return (
    <TextPage
      title="About / Contact"
      description="What Poly Haven is, what we do, and why we're doing it."
      url="/about-contact"
    >
      <AboutContact />
    </TextPage>
  )
}

export default AboutPage