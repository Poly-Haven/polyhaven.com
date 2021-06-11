import TextPage from 'components/Layout/TextPage/TextPage'
import FaqPage from 'components/FaqPage/FaqPage'

const FAQ = () => {
  return (
    <TextPage
      title="FAQ"
      description="Frequently questions and their answers."
      url="/faq"
    >
      <FaqPage />
    </TextPage>
  )
}

export default FAQ