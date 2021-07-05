import { useUser } from '@auth0/nextjs-auth0';

import Button from 'components/Button/Button'
import Loader from 'components/UI/Loader/Loader'

import TextPage from 'components/Layout/TextPage/TextPage'

const Page = () => {
  const { user, isLoading } = useUser();

  if (isLoading) return <Loader />

  if (!user) return (
    <TextPage
      title="Account"
      url="/account"
    >
      <h1>Account</h1>
      <p>You must be logged in to see this page.</p>
      <Button text="Login" href="/api/auth/login" />
    </TextPage>
  )

  return (
    <TextPage
      title="Account"
      url="/account"
    >
      <h1>Account</h1>
      <p><pre>{JSON.stringify(user, null, 2)}</pre></p>
    </TextPage>
  )
}

export default Page