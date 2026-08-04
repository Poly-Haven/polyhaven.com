import Head from 'components/Head/Head'
import Page from 'components/Layout/Page/Page'

import styles from './TextPage.module.scss'

const TextPage = ({ title, description, url, noindex, children }) => {
  return (
    <Page>
      <Head title={title} description={description} url={url} noindex={noindex} />
      <div className={styles.page}>{children}</div>
    </Page>
  )
}

TextPage.defaultProps = {
  description: 'The Public 3D Asset Library',
  noindex: false,
}

export default TextPage
