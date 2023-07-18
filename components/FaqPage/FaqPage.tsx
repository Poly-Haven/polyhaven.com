import { useRouter } from 'next/router'

const FaqPage = () => {
  const router = useRouter()

  return (
    <div>
      <h1>
        Moved to{' '}
        <a
          href={`https://docs.polyhaven.com/${router.locale}/faq`}
        >{`https://docs.polyhaven.com/${router.locale}/faq`}</a>
      </h1>
    </div>
  )
}

export default FaqPage
