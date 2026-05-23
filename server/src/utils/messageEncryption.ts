import crypto from 'crypto'

const PREFIX = 'enc:v1:'
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12

type MessageAttachment = {
  url: string
  name: string
  type: string
}

type MessageLike = {
  content?: string
  attachments?: MessageAttachment[]
}

function getEncryptionKey(): Buffer {
  const secret = process.env.MESSAGE_ENCRYPTION_KEY || process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'MESSAGE_ENCRYPTION_KEY or JWT_SECRET is required for message encryption',
    )
  }

  return crypto.scryptSync(secret, 'campustalk-message-encryption', 32)
}

export function encryptMessageText(plaintext: string): string {
  if (!plaintext) {
    return plaintext
  }

  if (plaintext.startsWith(PREFIX)) {
    return plaintext
  }

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()

  return `${PREFIX}${iv.toString('base64url')}:${authTag.toString('base64url')}:${encrypted.toString('base64url')}`
}

export function decryptMessageText(value: string): string {
  if (!value || !value.startsWith(PREFIX)) {
    return value
  }

  const payload = value.slice(PREFIX.length)
  const [ivB64, tagB64, dataB64] = payload.split(':')

  if (!ivB64 || !tagB64 || !dataB64) {
    return value
  }

  try {
    const key = getEncryptionKey()
    const iv = Buffer.from(ivB64, 'base64url')
    const authTag = Buffer.from(tagB64, 'base64url')
    const encrypted = Buffer.from(dataB64, 'base64url')

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  } catch {
    return value
  }
}

export function encryptMessageFields(
  content: string,
  attachments: MessageAttachment[] = [],
): { content: string; attachments: MessageAttachment[] } {
  return {
    content: encryptMessageText(content),
    attachments: attachments.map((attachment) => ({
      ...attachment,
      url: encryptMessageText(attachment.url),
    })),
  }
}

export function decryptMessageFields<T extends MessageLike>(message: T): T {
  if (!message) {
    return message
  }

  if (typeof message.content === 'string') {
    message.content = decryptMessageText(message.content)
  }

  if (Array.isArray(message.attachments)) {
    message.attachments = message.attachments.map((attachment) => ({
      ...attachment,
      url: decryptMessageText(attachment.url),
    }))
  }

  return message
}
