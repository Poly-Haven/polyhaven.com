import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { getPatronInfo } from 'utils/patronInfo';

import Button from 'components/Button/Button'
import Loader from 'components/UI/Loader/Loader'
import TextPage from 'components/Layout/TextPage/TextPage'
import Other from 'components/RewardInfo/Other';
import EarlyAccess from 'components/RewardInfo/EarlyAccess';
import OfflineAccess from 'components/RewardInfo/OfflineAccess';
import Sponsor from 'components/RewardInfo/Sponsor';
import Stakeholder from 'components/RewardInfo/Stakeholder';

const rewardInfo = (r, uuid, patron) => {
  switch (r) {
    case "Other":
      return <Other uuid={uuid} patron={patron} />
    case "Early Access":
      return <EarlyAccess />
    case "Offline Access":
      return <OfflineAccess uuid={uuid} patron={patron} />
    case "Sponsor":
      return <Sponsor uuid={uuid} patron={patron} />
    case "Stakeholder":
      return <Stakeholder />
    default:
      return null
  }
}

const Page = () => {
  const { user, isLoading } = useUser();
  const [uuid, setUuid] = useState(null);
  const [patron, setPatron] = useState({});
  const router = useRouter()
  const returnTo = router.query.returnTo

  useEffect(() => {
    if (uuid) {
      getPatronInfo(uuid)
        .then(resdata => {
          setPatron(resdata)
        })
    } else {
      if (user) {
        setUuid(user.sub.split('|').pop())
      }
    }
  }, [user, uuid]);

  if (isLoading) return <TextPage title="Account" url="/account"><Loader /></TextPage>

  if (!user) return (
    <TextPage
      title="Account"
      url="/account"
    >
      <h1>Account</h1>
      <p>You must be logged in to see this page.</p>
      <Button text="Login" href={`/api/auth/login${returnTo ? `?returnTo=${returnTo}` : ''}`} />
    </TextPage>
  )

  if (!Object.keys(patron).length) {
    return <TextPage title="Account" url="/account"><Loader /></TextPage>
  }

  if (patron['error']) {
    return (
      <TextPage title="Account" url="/account">
        <h1>Account</h1>
        <p>You don't seem to be a patron of Poly Haven :( if this is incorrect, please <Link href="/about-contact">get in touch</Link> so we can investigate the problem on this page. We'll need the following information:</p>
        <p><pre>{JSON.stringify(patron, null, 2)}</pre></p>
      </TextPage>
    )
  }

  if (patron['status'] !== "active_patron") {
    return (
      <TextPage
        title="Account"
        url="/account"
      >
        <h1>Hi {patron['display_name'] || patron['name']}!</h1>
        <p>It looks like you're no longer a patron of Poly Haven. That's OK, and we appreciate your past support :)</p>
      </TextPage>
    )
  }

  return (
    <TextPage
      title="Account"
      url="/account"
    >
      <h1 title={uuid} style={{ textAlign: "center" }}>Hi {(patron['display_name'] || patron['name']).trim()}!</h1>
      <p>You're currently supporting Poly Haven with ${patron['cents'] / 100} per month, thanks!</p>

      {patron['rewards'].length > 0 && <>
        <p>This grants you the following reward{patron['rewards'].length > 1 && "s"}:</p>

        {patron['rewards'].map((r, i) => <div key={i}>{rewardInfo(r, uuid, patron)}</div>)}
      </>}
      {/* <p><pre>{JSON.stringify(patron, null, 2)}</pre></p> */}
    </TextPage>
  )
}

export default Page