import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import locales from 'utils/locales'
import apiSWR from 'utils/apiSWR';

import TextPage from 'components/Layout/TextPage/TextPage'
import LocaleInfo from 'components/LocaleInfo/LocaleInfo';

const Page = () => {
  const { data: progress, error } = apiSWR(`/translation_progress`, { revalidateOnFocus: true });

  return (
    <TextPage
      title="Help Translate Poly Haven"
      description="More than half our users don't speak English as a first language, help us make Poly Haven friendlier for them!"
      url="/translate"
    >
      <div dir="ltr" style={{ textAlign: 'left' }}>
        <h1>Help Translate Poly Haven</h1>
        <p>Our assets are used by people all around the world - in fact more than half our users don't choose English as their first language!</p>
        <p>If you'd like to help us translate the site into other languages, please reach out to us on <a href="https://discord.gg/Dms7Mrs">Discord</a> or by <Link href="/about-contact">email</Link>.</p>
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '1em',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          flexWrap: 'wrap',
          padding: '0.5em',
        }}>
          {Object.keys(locales).map(l => l !== 'en' ?
            <LocaleInfo key={l} locale={l} flag={locales[l].flag} name={locales[l].name} translation_progress={progress} /> : null
          )}
        </div>

        <p>All text on the site is stored as a series of strings (sentences, paragraphs, buttons, headers, etc).</p>

        <p>The service we use for translations (<a href="https://i18nexus.com/">i18nexus</a>) automatically translates strings by default using Google Translate, which is a good start, but requires manual review and corrections.</p>

        <p>The basic workflow is thus to go through the list of strings and confirm or tweak the existing automatic translations.</p>

        <p>All strings have either an attached screenshot or a desciption (in the left most column) to provide some context on where the string is located on the website.</p>

        <img src="https://cdn.polyhaven.com/site_images/translations_ui.png" style={{ width: '100%' }} />

        <p>If you help contribute a significant portion of string translations (100+ strings), we want to thank you by:</p>

        <ul style={{ marginBottom: '3em' }}>
          <li>Giving you access to our Nextcloud server to sync our assets to your hard drive - the same service our <a href="https://www.patreon.com/polyhaven/overview">$5+ patrons</a> have access to.</li>
          <li>Crediting you in the language list at the top of this page.</li>
        </ul>

        <hr />

        <h1>Translation Guide:</h1>
        <h3>Proper Nouns</h3>
        <p>Make sure that the names of websites, software, and people are not translated, such as "Poly Haven", "Discord", "Patreon", etc.</p>

        <hr />
        <h3>{"{{variables}}"}</h3>
        <p>When you see a set of double brackets, like {"{{this}}"}, this indicates a variable that will be replaced by a value on the site.</p>
        <p>Make sure that sentence structure is maintained, but don't edit the text inside the brackets ("count" in this example).</p>
        <p>For example:</p>
        <q>John has {"{{count}}"} apples.</q>
        <q>约翰有 {"{{count}}"} 个苹果。</q>
        <p>Will turn into:</p>
        <q>John has 3 apples.</q>
        <q>约翰有 3 个苹果。</q>

        <hr />
        <h3>{"<lnk>tags</lnk>"}</h3>
        <p>Similar to {"{{variables}}"}, there are often HTML tags of various kinds present in the source text.</p>
        <p>You can edit what's between the opening and closing tags, and fix sentence structure, but don't edit the tag name itself.</p>
        <p>{`The <strong> and <em> tags are generally used for emphasis, while <lnk> is a link to another web page.`}</p>
        <p>For example:</p>
        <q>{`Thanks to our <lnk>supporters</lnk> for making Poly Haven possible`}</q>
        <p>Would be translated to:</p>
        <q>{`感谢我们的<lnk>支持者</lnk>使 Poly Haven 成为可能`}</q>

        <hr />
        <h3>Broken {"<lnk>formatting</lnk>"} and smileys :)</h3>
        <p>The database of translations is automatically filled with translations from Google Translate. This provides a good start, but it usually breaks formatting of tags and smileys.</p>
        <p>For example:</p>
        <q>This is a sentence with a {`<lnk>link</lnk>`}, and then a smiley :) Thanks!</q>
        <p>Which is auto-translated to:</p>
        <q>Esta es una oración con un<span className="text-red">{`<lnk>`}</span> enlace{`</lnk>`} y luego un emoticón<span className="text-red">: )</span> ¡Gracias!</q>
        <p>But it should be:</p>
        <q>Esta es una oración con un <span className="text-green">{`<lnk>`}</span>enlace{`</lnk>`} y luego un emoticón <span className="text-green">:)</span> ¡Gracias!</q>
        <p>Notice there is no space before the {`<lnk>`} tag, and the colon is moved one character to the left.</p>

        <hr />
        <h3>Maintaining Title Case</h3>
        <p>Often the automatically translated text does not maintain the same case as the source text.</p>
        <p>For example:</p>
        <q>This Is A Title</q>
        <p>Is translated to:</p>
        <q>Dit is een titel</q>
        <p>When it should be:</p>
        <q>Dit Is Een Titel</q>

      </div>
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