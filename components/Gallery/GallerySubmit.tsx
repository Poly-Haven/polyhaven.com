import { useTranslation, Trans } from 'next-i18next';
import React, { useRef, useState, useEffect } from 'react'
import Link from 'next/link';
import LinkText from 'components/LinkText/LinkText';
import useStoredState from 'hooks/useStoredState';
import { isURL, isEmail } from 'validator';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

import GalleryFormItem from './GalleryFormItem';
import Disabled from 'components/UI/Disabled/Disabled';
import Popup from 'components/UI/Popup/Popup';

import useQuery from 'hooks/useQuery';

import styles from './GallerySubmit.module.scss'
import btnStyles from 'components/UI/Button/Button.module.scss'
import { selectStyle } from 'styles/select'

const GallerySubmit = ({ assets, galleryApiUrl }) => {
  const { t: t_c } = useTranslation('common');
  const { t } = useTranslation('gallery');

  const [successPopup, showSuccessPopup] = useState(false)
  const query = useQuery();

  const [image, setImage] = useState(null)
  const imageRef = useRef(null)
  const [localImage, setLocalImage] = useState(null);
  const [artName, setArtName] = useState("")
  const [author, setAuthor] = useStoredState("gallery_author", "")
  const [email, setEmail] = useStoredState("gallery_email", "")
  const [link, setLink] = useStoredState("gallery_link", "")
  const [assetsUsed, setAssetsUsed] = useState([])
  const [software, setSoftware] = useState([])

  useEffect(() => {
    if (query && query.asset) {
      if (typeof query.asset === 'string' && assets.includes(query.asset)) {
        setAssetsUsed([{ value: query.asset, label: query.asset }])
      }
    }
  }, [query])

  const resetState = () => {
    setImage(null)
    setLocalImage(null)
    setArtName("")
    setAssetsUsed([])
    setSoftware([])
  }


  // VALIDATE FIELDS ------------------------------------------------------------------------------
  const conditions = {
    "Selected image": image !== null,
    "Your name": author.trim().length > 0,
    "Email": isEmail(email.trim()),
    "Link": link.trim().length == 0 || isURL(link.trim(), { require_protocol: true }),
    "Assets used": assetsUsed.length > 0,
  }

  let invalidFields = []
  let valid = true
  for (const [k, v] of Object.entries(conditions)) {
    if (v === false) {
      valid = false
      invalidFields.push(k)
    }
  }

  // SUBMIT ---------------------------------------------------------------------------------------
  const [busy, setBusyState] = useState(false)
  const [response, setResponseState] = useState({})
  const submit = async () => {
    setBusyState(true);

    const allFields = {
      artwork_name: artName.trim(),
      author: author.trim(),
      email: email.trim(),
      author_link: link.trim(),
      assets_used: assetsUsed.map(v => v.value),
      software: software.map(v => v.value),
      uuid: localStorage.getItem(`uuid`) || "UNKNOWN",
    }

    const body = new FormData();
    body.append("file", image);
    body.append("fields", JSON.stringify(allFields));
    await fetch(`${galleryApiUrl}/api/public/gallerySubmit`, {
      method: 'POST',
      body,
    })
      .then(res => res.json())
      .then(data => {
        console.log("Submitted to Gallery", data)
        setBusyState(false);
        setResponseState(data)

        if (data.message === "Submitted") {
          resetState()
          data.message = ""
          showSuccessPopup(true)
        }
      })
  }

  // Image Selection
  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      if (i.type !== 'image/jpeg') {
        alert(t('submit.err-jpg'))
        return
      }
      if (i.size > 1 * 1024 * 1024) {
        alert(t('submit.err-size'))
        return
      }

      setImage(i);
      setLocalImage(URL.createObjectURL(i));
    }
  };

  // Software used
  let softwareOptions = [
    // 3D DCCs
    { value: "blender", label: "Blender" },
    { value: "3ds max", label: "3DS Max" },
    { value: "maya", label: "Maya" },
    { value: "cinema 4d", label: "Cinema 4D" },
    { value: "houdini", label: "Houdini" },
    { value: "daz", label: "Daz 3D" },
    { value: "lightwave", label: "LightWave" },
    { value: "vred", label: "VRED" },
    { value: "modo", label: "Modo" },
    { value: "zbrush", label: "ZBrush" },
    // Game engines
    { value: "unreal", label: "Unreal Engine" },
    { value: "unity", label: "Unity" },
    { value: "Godot", label: "Godot" },
    // CAD
    { value: "sketchup", label: "SketchUp" },
    { value: "fusion360", label: "Fusion 360" },
    { value: "rhino", label: "Rhino" },
    { value: "solidworks", label: "SolidWorks" },
    // Render engines
    { value: "cycles", label: "Cycles" },
    { value: "eevee", label: "Eevee" },
    { value: "corona", label: "Corona" },
    { value: "vray", label: "V-Ray" },
    { value: "keyshot", label: "KeyShot" },
    { value: "arnold", label: "Arnold Renderer" },
    { value: "redshift", label: "Redshift" },
    { value: "octane", label: "Octane" },
  ];
  const updateSoftware = newValue => {
    setSoftware(newValue)
  }

  // Assets Used
  let assetOptions = [];
  for (const assetID of assets) {
    assetOptions.push({
      value: assetID,
      label: assetID,
    })
  }
  const updateAssetsUsed = newValue => {
    const assetLimit = 10
    if (newValue.length > assetLimit) {
      alert(t('submit.err-asset-limit', { limit: assetLimit }))
      return
    }
    setAssetsUsed(newValue)
  }

  return (
    <div className={styles.wrapper}>
      <h1>{t('submit.title')}</h1>
      <p><Trans
        i18nKey='submit.s1p1'
        t={t}
        components={{ lnk: <LinkText href="/gallery" /> }} /></p>
      <p>{t('submit.s1p2')}</p>
      <p><Trans
        i18nKey="submit.s1p3"
        t={t}
        components={{ em: <em /> }}
      /></p>

      <h2>{t('submit.s2')}</h2>
      <ol>
        <li><Trans
          i18nKey="submit.s2p1"
          t={t}
          components={{ strong: <strong /> }}
        /></li>
        <li><Trans
          i18nKey="submit.s2p2"
          t={t}
          components={{ strong: <strong /> }}
        /></li>
        <li>{t('submit.s2p3')}</li>
      </ol>

      <h2>{t('submit.s3')}</h2>
      <p><Trans
        i18nKey="submit.s3p1"
        t={t}
        components={{ strong: <strong /> }}
      /></p>
      <p>{t('submit.s3p2')}</p>
      <p><Trans
        i18nKey="submit.s3p3"
        t={t}
        components={{ lnk: <a href="https://discord.gg/Dms7Mrs" /> }}
      /></p>
      <p>{t('submit.s3p4')}</p>
      <p>{t('submit.s3p5')}</p>
      <ul>
        <li>{t('submit.s3p5l1')}</li>
        <li>{t('submit.s3p5l2')}</li>
        <li>{t('submit.s3p5l3')}</li>
        <li>{t('submit.s3p5l4')}</li>
        <li>{t('submit.s3p5l5')}</li>
        <li><Trans
          i18nKey="submit.s3p5l6"
          t={t}
          components={{ strong: <strong /> }}
        /></li>
      </ul>

      <div className={styles.form}>
        <form onSubmit={e => { e.preventDefault() }}>
          {localImage ? <div className={styles.imagePreview}><img src={localImage} /></div> : null}
          <div className={styles.buttonWrapper}>
            <label htmlFor="upload-image" className={`${btnStyles.button} ${btnStyles[image ? 'hollow' : 'accent']} ${styles.imageSelect}`}>
              {image ? t('submit.form.file-change') : t('submit.form.select-change')}
              <br /><span className={styles.sub}>{t('submit.form.file-size')}</span>
            </label>
          </div>
          <input type="file" ref={imageRef} name="myImage" id="upload-image" className={styles.hideFileInput} onChange={uploadToClient} />

          <GalleryFormItem
            label={t('submit.form.art-name')}
            optional={true}
          >
            <input
              type="text"
              value={artName}
              onChange={e => setArtName(e.target.value)}
            />
          </GalleryFormItem>
          <GalleryFormItem
            label={t('submit.form.your-name')}
          >
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder={t('submit.form.your-name-d')}
            />
          </GalleryFormItem>
          <GalleryFormItem
            label={t('submit.form.your-email')}
          >
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('submit.form.your-email-d')}
            />
          </GalleryFormItem>
          <GalleryFormItem
            label={t('submit.form.link')}
            optional={true}
          >
            <input
              type="text"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder={t('submit.form.link-d')}
            />
          </GalleryFormItem>
          <GalleryFormItem
            label={t('submit.form.software')}
            optional={true}
          >
            <CreatableSelect
              styles={selectStyle}
              className={styles.select}
              isMulti
              onChange={updateSoftware}
              options={softwareOptions}
              value={software}
              placeholder={t('submit.form.software-d')}
            />
          </GalleryFormItem>
          <GalleryFormItem
            label={t('submit.form.assets')}
          >
            <div className={styles.assetSelectionWrapper}>
              <Select
                styles={selectStyle}
                className={styles.select}
                isMulti
                onChange={updateAssetsUsed}
                options={assetOptions}
                value={assetsUsed}
                placeholder={t('submit.form.assets-d')}
              />
              {assetsUsed ?
                <div className={styles.assetsWrapper} >
                  {assetsUsed.map(a =>
                    <Link href={`/a/${a.value}`} key={a.value}><a>
                      <img src={`https://cdn.polyhaven.com/asset_img/thumbs/${a.value}.png?height=100&width=200`} />
                    </a></Link>
                  )}
                </div> : null}
            </div>
          </GalleryFormItem>
        </form>
        <div className={styles.submit}>
          <div className="spacer" />
          <div>{Object.keys(response).length ? response['message'] : null}</div>
          <Disabled
            tooltip={busy ? t_c('please-wait') : `${t_c('missing-invalid')}: ${invalidFields.join(', ')}`}
            disabled={!valid || busy}
          >
            <div
              className={`${btnStyles.button} ${btnStyles['accent']}`}
              onClick={submit}
            >
              <div className={btnStyles.inner}>
                {busy ? t('submit.form.uploading') : `🚀 ${t('submit.form.submit')}`}
              </div>
            </div>
          </Disabled>
        </div>
      </div>
      <Popup show={successPopup} hide={_ => showSuccessPopup(false)}>
        <p>✅ <strong>{t('submit.form.thanks')}</strong></p>
        <p>{t('submit.form.thanks-d')}</p>
      </Popup>
    </div>
  )
}

export default GallerySubmit