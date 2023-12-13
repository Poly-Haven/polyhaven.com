/*
This function is used to weakly encrypt client-side text such as email addresses to give spam scappers a hard time. It should not be used for any sensitive data since the secret key is shown here in plain text and can be extracted on the client side.
*/

import crypto from 'crypto'

import dotenv from 'dotenv'

dotenv.config()

const algorithm = 'aes-256-ctr'
const secretKey = 'r3CY8JYZ09ZpF1iDJ5enqNh1kbddwpyf'

export function encrypt(text) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex'),
  }
}

export function decrypt(hash) {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])
  return decrpyted.toString()
}
