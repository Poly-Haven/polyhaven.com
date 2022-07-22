import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import locales from 'utils/locales'

import TextPage from 'components/Layout/TextPage/TextPage'
import LocaleFlag from 'components/Layout/Header/Nav/LocaleFlag';

const Page = () => {
  return (
    <TextPage
      title="Help Translate Poly Haven"
      url="/translate"
    >
      <h1>Help Translate Poly Haven</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '0.5em',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flexWrap: 'wrap',
        fontSize: '2em',
        padding: '0.5em',
      }}>
        {Object.keys(locales).map(l =>
          <LocaleFlag key={l} locale={l} flag={locales[l].flag} />
        )}
      </div>
      <p>Our assets are used by people all around the world - in fact more than half our users don't choose English as their first language!</p>
      <p>If you'd like to help us translate the site into other languages, please reach out to us on <a href="https://discord.gg/Dms7Mrs">Discord</a> or by <Link href="/about-contact">email</Link>.</p>

      <h2>{"{{variables}}"}</h2>
      <p>When you see a set of double brackets, like {"{{this}}"}, this indicates a variable that will be replaced by a value on the site.</p>
      <p>Make sure that sentence structure is maintained, but don't edit the text inside the brackets ("count" in this example).</p>
      <p>For example:</p>
      <q>John has {"{{count}}"} apples.</q>
      <q>约翰有 {"{{count}}"} 个苹果。</q>
      <p>Will turn into:</p>
      <q>John has 3 apples.</q>
      <q>约翰有 3 个苹果。</q>

      <h2>{"<lnk>tags</lnk>"}</h2>
      <p>Similar to {"{{variables}}"}, there are often HTML tags of various kinds present in the source text.</p>
      <p>You can edit what's between the opening and closing tags, and fix sentence structure, but don't edit the tag name itself.</p>
      <p>{`The <strong> and <em> tags are generally used for emphasis, while <lnk> is a link to another web page.`}</p>
      <p>For example:</p>
      <q>{`Thanks to our <lnk>supporters</lnk> for making Poly Haven possible`}</q>
      <p>Would be translated to:</p>
      <q>{`感谢我们的<lnk>支持者</lnk>使 Poly Haven 成为可能`}</q>

      <h2>Broken{"<lnk> formatting</lnk>"} and smileys: )</h2>
      <p>The database of translations is automatically filled with translations from Google Translate. This provides a good start, but it usually breaks formatting of tags and smileys.</p>
      <p>For example:</p>
      <q>This is a sentence with a {`<lnk>link</lnk>`}, and then a smiley :) Thanks!</q>
      <p>Which is auto-translated to:</p>
      <q>Esta es una oración con un<span className="text-orange">{`<lnk>`}</span> enlace{`</lnk>`} y luego un emoticón<span className="text-orange">: )</span> ¡Gracias!</q>
      <p>But it should be:</p>
      <q>Esta es una oración con un <span className="text-green">{`<lnk>`}</span>enlace{`</lnk>`} y luego un emoticón <span className="text-green">:)</span> ¡Gracias!</q>
      <p>Notice there is no space before the {`<lnk>`} tag, and the colon is moved one character to the left.</p>

      <h2>Maintaining Title Case</h2>
      <p>Often the automatically translated text does not maintain the same case as the source text.</p>
      <p>For example:</p>
      <q>This Is A Title</q>
      <p>Is translated to:</p>
      <q>Dit is een titel</q>
      <p>When it should be:</p>
      <q>Dit Is Een Titel</q>

      <h2>Proper Nouns</h2>
      <p>Make sure that the names of websites, software, and people are not translated, such as "Poly Haven", "Discord", "Patreon", etc.</p>

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