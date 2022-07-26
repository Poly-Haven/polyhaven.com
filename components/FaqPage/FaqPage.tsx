import { useTranslation, Trans } from 'next-i18next';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import LinkText from 'components/LinkText/LinkText';

import useQuery from 'hooks/useQuery';

import FaqItem from './FaqItem'

const FaqPage = () => {
  const { t } = useTranslation(['common', 'faq']);
  const [clicked, setClicked] = useState("")
  const query = useQuery();

  useEffect(() => {
    if (query && query.q) {
      const qID = `${query.q}`
      setClicked(qID)
      document.querySelector(`#${qID}`).scrollIntoView({ behavior: 'smooth' })
    }
  }, [query])

  return (
    <div>
      <h1>{t('faq:title')}</h1>
      <FaqItem question={t('faq:q01')} activeQ={clicked} qID="commercial">
        <p><Trans
          i18nKey="faq:q01p1"
          t={t}
          components={{ lnk: <LinkText href="/license" /> }}
        /></p>
      </FaqItem>
      <FaqItem question={t('faq:q02')} activeQ={clicked} qID="sell">
        <p><Trans
          i18nKey="faq:q02p1"
          t={t}
          components={{
            em: <em />,
            lnk: <LinkText href="/license" />
          }}
        /></p>
        <p>{t('faq:q02p2')}</p>
        <p><Trans
          i18nKey="faq:q02p3"
          t={t}
          components={{
            lnk: <a href="https://www.patreon.com/polyhaven/overview" />
          }}
        /></p>
      </FaqItem>
      <FaqItem question={t('faq:q03')} activeQ={clicked} qID="commissions">
        <p><Trans
          i18nKey="faq:q03p1"
          t={t}
          components={{
            lnk: <LinkText href="/about-contact" />
          }}
        /></p>
        <p>{t('faq:q03p2')}</p>
      </FaqItem>
      <FaqItem question={t('faq:q04')} activeQ={clicked} qID="funding">
        <p>{t('faq:q04p1')}</p>
        <p><Trans
          i18nKey="faq:q04p2"
          t={t}
          components={{
            lnk: <LinkText href="/finance-reports" />
          }}
        /></p>
      </FaqItem>
      <FaqItem question={t('faq:q05')} activeQ={clicked} qID="what-is-an-hdri">
        <p><Trans
          i18nKey="faq:q05p1"
          t={t}
          components={{
            lnk1: <a href="https://en.wikipedia.org/wiki/OpenEXR" />,
            lnk2: <a href="https://en.wikipedia.org/wiki/RGBE_image_format" />,
          }}
        /></p>
        <p><Trans
          i18nKey="faq:q05p2"
          t={t}
          components={{
            lnk: <a href="https://en.wikipedia.org/wiki/Equirectangular_projection" />
          }}
        /></p>
        <p>{t('faq:q05p3')}</p>
      </FaqItem>
      <FaqItem question={t('faq:q06')} activeQ={clicked} qID="use-hdri">
        <p>{t('faq:q06p1')}</p>
        <ol>
          <li><a href="https://www.youtube.com/watch?v=Pi4Ft7M8UOU">Blender + Cycles</a></li>
          <li><a href="https://www.youtube.com/watch?v=riBa2YWfajc">3ds Max + Corona</a></li>
        </ol>
        <p>{t('faq:q06p2')}</p>
      </FaqItem>
      <FaqItem question={t('faq:q07')} activeQ={clicked} qID="evs">
        <p>{t('faq:q07p1')}</p>
        <p>{t('faq:q07p2')}</p>
        <p><Trans
          i18nKey="faq:q07p3"
          t={t}
          components={{
            lnk: <a href="http://blog.polyhaven.com/what-is-clipping/" />,
            strong: <strong />
          }}
        /></p>
      </FaqItem>
      <FaqItem question={t('faq:q08')} activeQ={clicked} qID="camera">
        <p><Trans
          i18nKey="faq:q08p1"
          t={t}
          components={{
            lnk: <a href="https://blog.polyhaven.com/how-to-create-high-quality-hdri/" />
          }}
        /></p>
      </FaqItem>
      <FaqItem question={t('faq:q09')} activeQ={clicked} qID="albedo">
        <p>{t('faq:q09p1')}</p>
        <p>{t('faq:q09p2')}</p>
        <p>{t('faq:q09p3')}</p>
        <p>{t('faq:q09p4')}</p>
      </FaqItem>
      <FaqItem question={t('faq:q10')} activeQ={clicked} qID="service-worker">
        <p><Trans
          i18nKey="faq:q10p1"
          t={t}
          components={{
            strong: <strong />,
            em: <em />,
          }}
        /></p>
        <p><Trans
          i18nKey="faq:q10p2"
          t={t}
          components={{
            em: <em />,
            lnk: <a href="https://dev.webonomic.nl/fixing-firefox-failed-to-register-update-a-serviceworker-for-scope" />
          }}
        /></p>
        <p>{t('faq:q10p3')}</p>
      </FaqItem>
      <FaqItem question={t('faq:q11')} activeQ={clicked} qID="upload">
        <p>{t('faq:q11p1')}</p>
        <p>{t('faq:q11p2')}</p>
        <p><Link href="/contribute">{t('faq:q11p3')}</Link>.</p>
      </FaqItem>
      <FaqItem question={t('faq:q12')} activeQ={clicked} qID="photoscanning">
        <p>{t('faq:q12p1')}</p>
      </FaqItem>
      <FaqItem question={t('faq:q13')} activeQ={clicked} qID="guns">
        <p>{t('faq:q13p1')}</p>
        <p>{t('faq:q13p2')}</p>
        <p>{t('faq:q13p3')}</p>
      </FaqItem>
    </div>
  )
}

export default FaqPage
