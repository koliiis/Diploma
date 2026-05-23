import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_LABEL,
} from '../config/uploads'

type AttachmentInput = {
  url: string
  name: string
  type?: string
}

function getDataUrlSizeBytes(dataUrl: string): number | null {
  if (!dataUrl.startsWith('data:')) {
    return null
  }

  const commaIndex = dataUrl.indexOf(',')

  if (commaIndex === -1) {
    return null
  }

  const base64 = dataUrl.slice(commaIndex + 1)

  if (!base64) {
    return 0
  }

  try {
    return Buffer.from(base64, 'base64').length
  } catch {
    return null
  }
}

export function validateMessageAttachments(
  attachments: AttachmentInput[],
): string | null {
  for (const attachment of attachments) {
    if (!attachment.url?.trim()) {
      return `Вкладення «${attachment.name}» має некоректний формат`
    }

    const sizeBytes = getDataUrlSizeBytes(attachment.url)

    if (sizeBytes === null) {
      return `Вкладення «${attachment.name}» має некоректний формат`
    }

    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
      return `Файл «${attachment.name}» перевищує ${MAX_FILE_SIZE_LABEL}`
    }
  }

  return null
}
