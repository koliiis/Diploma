import { decryptMessageText } from './messageEncryption'

type SerializableMessage = {
  toObject?: () => Record<string, unknown>
}

export type SerializeMessageOptions = {
  includeAttachmentData?: boolean
}

type AttachmentRecord = {
  url?: string
  name: string
  type: string
}

function decryptAttachments(
  attachments: AttachmentRecord[],
  includeAttachmentData: boolean,
): AttachmentRecord[] {
  if (!includeAttachmentData) {
    return attachments.map(({ name, type }) => ({ name, type }))
  }

  return attachments.map((attachment) => ({
    ...attachment,
    url: decryptMessageText(attachment.url ?? ''),
  }))
}

export function serializeMessageForResponse<T extends SerializableMessage>(
  doc: T | null,
  options: SerializeMessageOptions = {},
): Record<string, unknown> | null {
  if (!doc) {
    return null
  }

  const includeAttachmentData = options.includeAttachmentData ?? true

  const plain =
    typeof doc.toObject === 'function'
      ? doc.toObject()
      : ({ ...doc } as Record<string, unknown>)

  if (typeof plain.content === 'string') {
    plain.content = decryptMessageText(plain.content)
  }

  if (Array.isArray(plain.attachments)) {
    plain.attachments = decryptAttachments(
      plain.attachments as AttachmentRecord[],
      includeAttachmentData,
    )
  }

  return plain
}

export function serializeMessagesForResponse<T extends SerializableMessage>(
  docs: T[],
  options: SerializeMessageOptions = {},
): Record<string, unknown>[] {
  return docs.map((doc) => serializeMessageForResponse(doc, options)!)
}
