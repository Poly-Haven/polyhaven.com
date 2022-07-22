import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import TextPage from 'components/Layout/TextPage/TextPage'

const Page = () => {

  return (
    <TextPage
      title="Help Translate Poly Haven"
      url="/translate"
    >
      <h1>Help Translate Poly Haven</h1>
      <p><em>Placeholder page with some notes for now...</em></p>
      <ul>
        <li>Handling {"{{variables}}"}</li>
        <li>Handling {"<lnk>tags</lnk>"}</li>
        <li>Maintain {"<strong>emphasis</strong>"} and {"<lnk>links</lnk>"} even when sentence structure changes</li>
        <li>Fixing broken{"<lnk> formatting</lnk>"} and smileys: )</li>
        <li>Maintaining Title Case</li>
        <li>Proper nouns like Discord and Patreon</li>
      </ul>
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

export default Page