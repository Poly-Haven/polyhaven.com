import assetTypeNames from 'constants/asset_type_names.json'

import styles from './CodeBlock.module.scss'

const MAX_INLINE_ARRAY_LINE_LENGTH = 120

// Like JSON.stringify(value, null, 2), but an array is kept on a single line instead of one item per line,
// as long as that line (including the indentation and key it's under) stays under MAX_INLINE_ARRAY_LINE_LENGTH.
const stringifyCompactArrays = (value, indent = '  ', currentIndent = '', prefixLength = 0) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const inline = `[${value.map((v) => JSON.stringify(v)).join(', ')}]`
    if (prefixLength + inline.length <= MAX_INLINE_ARRAY_LINE_LENGTH) return inline

    const nextIndent = currentIndent + indent
    const items = value.map((v) => `${nextIndent}${stringifyCompactArrays(v, indent, nextIndent, nextIndent.length)}`)
    return `[\n${items.join(',\n')}\n${currentIndent}]`
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) return '{}'

    const nextIndent = currentIndent + indent
    const lines = keys.map((k) => {
      const prefix = `${nextIndent}${JSON.stringify(k)}: `
      return `${prefix}${stringifyCompactArrays(value[k], indent, nextIndent, prefix.length)}`
    })
    return `{\n${lines.join(',\n')}\n${currentIndent}}`
  }
  return JSON.stringify(value)
}

// Matches (in order): quoted strings (optionally followed by a key's colon), true/false, null, numbers.
const JSON_TOKEN_REGEX = /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false)\b|\b(null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g

// Matches (in order): the `curl` command, flags like -H/--header, quoted strings, bare URLs.
const CURL_TOKEN_REGEX = /(\bcurl\b)|(--?[A-Za-z][\w-]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(https?:\/\/\S+)/g

const highlightJson = (code, showTypeComments) => {
  const nodes = []
  let lastIndex = 0
  let key = 0
  let match
  let pendingKey = null
  // A comment waits here until we find the next newline, so it lands after the trailing comma (`0, // HDRI`)
  // instead of splitting the value from its comma (`0 // HDRI,`).
  let pendingComment = null

  const pushLiteral = (text) => {
    if (pendingComment) {
      const newlineIndex = text.indexOf('\n')
      if (newlineIndex !== -1) {
        nodes.push(text.slice(0, newlineIndex))
        nodes.push(
          <span key={key++} className={styles.comment}>
            {` // ${pendingComment}`}
          </span>
        )
        nodes.push(text.slice(newlineIndex))
        pendingComment = null
        return
      }
    }
    nodes.push(text)
  }

  JSON_TOKEN_REGEX.lastIndex = 0
  while ((match = JSON_TOKEN_REGEX.exec(code))) {
    if (match.index > lastIndex) pushLiteral(code.slice(lastIndex, match.index))
    const [, str, colon, bool, nul, num] = match

    if (str) {
      nodes.push(
        <span key={key++} className={colon ? styles.key : styles.string}>
          {str}
        </span>
      )
      if (colon) {
        nodes.push(colon)
        pendingKey = JSON.parse(str)
      } else {
        pendingKey = null
      }
    } else if (bool) {
      nodes.push(
        <span key={key++} className={styles.boolean}>
          {bool}
        </span>
      )
      pendingKey = null
    } else if (nul) {
      nodes.push(
        <span key={key++} className={styles.null}>
          {nul}
        </span>
      )
      pendingKey = null
    } else if (num) {
      nodes.push(
        <span key={key++} className={styles.number}>
          {num}
        </span>
      )
      if (showTypeComments && pendingKey === 'type') {
        const typeName = assetTypeNames[Number(num)]
        if (typeName !== undefined) pendingComment = typeName
      }
      pendingKey = null
    }
    lastIndex = JSON_TOKEN_REGEX.lastIndex
  }
  if (lastIndex < code.length) pushLiteral(code.slice(lastIndex))
  if (pendingComment) {
    nodes.push(
      <span key={key++} className={styles.comment}>
        {` // ${pendingComment}`}
      </span>
    )
  }
  return nodes
}

const highlightCurl = (code) => {
  const nodes = []
  let lastIndex = 0
  let key = 0
  let match

  CURL_TOKEN_REGEX.lastIndex = 0
  while ((match = CURL_TOKEN_REGEX.exec(code))) {
    if (match.index > lastIndex) nodes.push(code.slice(lastIndex, match.index))
    const [full, cmd, flag, , url] = match

    let className = styles.string
    if (cmd) className = styles.command
    else if (flag) className = styles.flag
    else if (url) className = styles.url

    nodes.push(
      <span key={key++} className={className}>
        {full}
      </span>
    )
    lastIndex = CURL_TOKEN_REGEX.lastIndex
  }
  if (lastIndex < code.length) nodes.push(code.slice(lastIndex))
  return nodes
}

const HIGHLIGHTERS = {
  json: highlightJson,
  curl: highlightCurl,
}

const CodeBlock = ({ code, lang, scrollable, showTypeComments, className }) => {
  // For json, `code` is the raw value to display (object/array/etc), not a pre-stringified string.
  const source = lang === 'json' ? stringifyCompactArrays(code) : code
  const highlight = HIGHLIGHTERS[lang]
  const content = highlight ? highlight(source, showTypeComments) : source

  return (
    <pre className={`${styles.codeBlock} ${styles[lang] || ''} ${scrollable ? styles.scrollable : ''} ${className}`}>
      <code>{content}</code>
    </pre>
  )
}

CodeBlock.defaultProps = {
  lang: 'json',
  scrollable: false,
  showTypeComments: false,
  className: '',
}

export default CodeBlock
