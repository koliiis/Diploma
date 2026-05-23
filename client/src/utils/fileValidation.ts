import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from '../config/uploads'

export function isFileWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES
}

export function getDataUrlSizeBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',')

  if (commaIndex === -1) {
    return 0
  }

  const base64 = dataUrl.slice(commaIndex + 1)

  try {
    return atob(base64).length
  } catch {
    return Number.MAX_SAFE_INTEGER
  }
}

export function isDataUrlWithinSizeLimit(dataUrl: string): boolean {
  return getDataUrlSizeBytes(dataUrl) <= MAX_FILE_SIZE_BYTES
}

export function getFileSizeLimitMessage(fileName: string): string {
  return `Файл «${fileName}» перевищує ${MAX_FILE_SIZE_LABEL}`
}
