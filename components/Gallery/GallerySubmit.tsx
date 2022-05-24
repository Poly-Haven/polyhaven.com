import React, { useState } from 'react'
import Link from 'next/link';
import useStoredState from 'hooks/useStoredState';
import { isURL, isEmail } from 'validator';
import Select from 'react-select';

import GalleryFormItem from './GalleryFormItem';
import Disabled from 'components/UI/Disabled/Disabled';

import styles from './GallerySubmit.module.scss'
import btnStyles from 'components/Button/Button.module.scss'
import { selectStyle } from 'styles/select'

const GallerySubmit = ({ assets }) => {
  const [artName, setArtName] = useState("")
  const [author, setAuthor] = useStoredState("gallery_author", "")
  const [email, setEmail] = useStoredState("gallery_email", "")
  const [link, setLink] = useStoredState("gallery_link", "")
  const [assetsUsed, setAssetsUsed] = useState([])
  const [software, setSoftware] = useState([])


  // VALIDATE FIELDS ------------------------------------------------------------------------------
  const conditions = {
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

    const allFields = { artName, author, email, link, assetsUsed, software }
    console.log("submit")

    // await fetch(`/api/submitAsset`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(allFields),
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     setBusyState(false);
    //     setResponseState(data)
    //     // if (data.status === 200) {
    //     //   router.push(`/review/${slug}`)
    //     // }
    //   })
  }

  let assetOptions = [];
  for (const [assetID, assetData] of Object.entries(assets)) {
    assetOptions.push({
      value: assetID,
      label: assetID,
    })
  }

  const updateAssetsUsed = newValue => {
    setAssetsUsed(newValue)
  }

  let numAssets = 0;
  return (
    <div className={styles.wrapper}>
      <h1>Submit Your Render</h1>
      <p>Have you created some <Link href="/gallery">awesome artwork</Link> using one of our assets? Show it off on this site!</p>
      <p>After you submit your render it'll be sent to us for approval. If we like it, it'll show in the gallery for a few weeks, and also on the pages of the assets you used to create it.</p>
      <p>If we like your render <em>a lot</em>, we'll feature it permanently and share it on our social media.</p>

      <h2>Rules:</h2>
      <ol>
        <li>The artwork <strong>must be your own creation</strong>, and you must be allowed to display it publically.</li>
        <li>You must have used at least one of <strong>Poly Haven's HDRIs/textures/models</strong> in the creation of your artwork.</li>
        <li>Nudity or other NSFW content cannot be accepted.</li>
      </ol>

      <h2>Note:</h2>
      <p>We get <strong>a lot</strong> of submissions, so unfortunately we can only accept the highest quality artwork to prevent the gallery from becoming cluttered.</p>
      <p>If you would like to ask for feedback on your render before submitting it, we have a very helpful community on <a href="https://discord.gg/Dms7Mrs">Discord</a>.</p>
      <p>We'll notify you by email if your render is accepted or rejected. This may take a day or two as we tend to review submissions in bulk.</p>
      <p>Common reasons for rejection:</p>
      <ul>
        <li>Low-effort renders (e.g. simple lighting tests).</li>
        <li>Low quality artwork.</li>
        <li>No Poly Haven assets used.</li>
        <li>Very similar render from another artist already present (e.g. "car on backplate" type renders with the same backplate).</li>
        <li>Too many submissions - typically we accept at most 3 different images per artist per month.</li>
        <li>Multiple renders of the same project (different camera angles or lighting setups) - <strong>only submit your best render for each project</strong>, and then link to your ArtStation page where people can find more.</li>
      </ul>

      <div className={styles.form}>
        <form onSubmit={e => { e.preventDefault() }}>
          <GalleryFormItem
            label="Artwork name"
            optional={true}
          >
            <input
              type="text"
              value={artName}
              onChange={e => setArtName(e.target.value)}
            />
          </GalleryFormItem>
          <GalleryFormItem
            label="Your name"
          >
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder="As you want to be credited."
            />
          </GalleryFormItem>
          <GalleryFormItem
            label="Your email"
          >
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Used only to notify you when your artwork is published. Stored securely and not shared with anyone."
            />
          </GalleryFormItem>
          <GalleryFormItem
            label="Link"
            optional={true}
          >
            <input
              type="text"
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder="Your website/portfolio, or a link to more renders of this project."
            />
          </GalleryFormItem>
          <GalleryFormItem
            label="Assets used"
          >
            <div className={styles.assetSelectionWrapper}>
              <Select
                styles={selectStyle}
                className={styles.select}
                isMulti
                onChange={updateAssetsUsed}
                options={assetOptions}
                value={assetsUsed}
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
            tooltip={busy ? "Please wait..." : `Missing or invalid: ${invalidFields.join(', ')}`}
            disabled={!valid || busy}
          >
            <div
              className={`${btnStyles.button} ${btnStyles['accent']}`}
              onClick={submit}
            >
              <div className={btnStyles.inner}>
                Submit
              </div>
            </div>
          </Disabled>
        </div>
      </div>
    </div>
  )
}

export default GallerySubmit