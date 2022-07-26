import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation, Trans } from 'next-i18next';
import Link from 'next/link';
import LinkText from 'components/LinkText/LinkText';

import TextPage from 'components/Layout/TextPage/TextPage'

const LicensePage = () => {
  const { t: t_c } = useTranslation('common');
  const { t } = useTranslation('license');

  return (
    <TextPage
      title={t_c('nav.license')}
      description={t('description')}
      url="/license"
    >
      <h1>{t('title')}</h1>
      <p><Trans
        i18nKey="p1"
        t={t}
        components={{
          lnk1: <LinkText href="/hdris" />,
          lnk2: <LinkText href="/textures" />,
          lnk3: <LinkText href="/models" />,
        }}
      /></p>
      <p><Trans
        i18nKey="p2"
        t={t}
        components={{
          lnk1: <a href="https://creativecommons.org/publicdomain/zero/1.0/" />,
          lnk2: <a href="https://en.wikipedia.org/wiki/Public_domain" />,
        }}
      /></p>
      <p><Trans
        i18nKey="p3"
        t={t}
        components={{ lnk: <a href="https://wiki.creativecommons.org/wiki/CC0_FAQ" /> }}
      /></p>
      <q>Once the creator or a subsequent owner of a work applies CC0 to a work, the work is no longer his or hers in any meaningful sense under copyright law. Anyone can then use the work in any way and for any purpose, including commercial purposes [...] Think of CC0 as the "no rights reserved" option. CC0 is a useful tool for clarifying that you do not claim copyright in a work anywhere in the world.</q>
      <p>{t('p4')}</p>
      <ul>
        <li><Trans
          i18nKey="p5l1"
          t={t}
          components={{ b: <strong /> }}
        /></li>
        <li><Trans
          i18nKey="p5l2"
          t={t}
          components={{ b: <strong /> }}
        /></li>
        <li><Trans
          i18nKey="p5l3"
          t={t}
          components={{ b: <strong /> }}
        /></li>
      </ul>
      <p><Trans
        i18nKey="p6"
        t={t}
        components={{
          lnk1: <a href="https://creativecommons.org/publicdomain/zero/1.0/" />,
          lnk2: <a href="https://wiki.creativecommons.org/wiki/CC0" />,
          lnk3: <a href="https://wiki.creativecommons.org/wiki/CC0_FAQ" />,
        }}
      /></p>
      <h1>{t('p7')}</h1>
      <p>{t('p8')}</p>
      <p>{t('p9')}</p>
      <p>{t('p10')}</p>
      <p>{t('p11')}</p>
      <p>{t('p12')}</p>
      <p><Trans
        i18nKey="p13"
        t={t}
        components={{ lnk: <a href="https://www.patreon.com/polyhaven/overview" /> }}
      /></p>
    </TextPage>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'license'])),
    },
  };
}

export default LicensePage