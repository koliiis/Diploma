import type { Message } from '../api/messages'
import {
  getMessageAttachment,
  getMessageAttachmentsBatch,
  type MessageAttachment,
} from '../api/messages'
import { MAX_FILE_SIZE_BYTES } from '../config/uploads'

const DB_NAME = 'campustalk-attachments'
const STORE_NAME = 'attachments'
const DB_VERSION = 1

type CachedAttachmentRecord = {
  key: string
  messageId: string
  index: number
  url: string
  name: string
  type: string
  cachedAt: number
}

export type AttachmentRef = {
  messageId: string
  index: number
  metadata: MessageAttachment
}

const memoryCache = new Map<string, MessageAttachment>()
const inflight = new Map<string, Promise<MessageAttachment>>()

const BATCH_SIZE = 15

export function cacheKey(messageId: string, index: number) {
  return `${messageId}:${index}`
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      dbPromise = null
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' })
      }
    }
  })

  return dbPromise
}

function canCacheAttachment(attachment: MessageAttachment): attachment is MessageAttachment & {
  url: string
} {
  if (!attachment.url?.startsWith('data:')) {
    return false
  }

  return attachment.url.length <= MAX_FILE_SIZE_BYTES * 2
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

export function getAttachmentMemoryKey(messageId: string, index: number) {
  return cacheKey(messageId, index)
}

export async function getCachedAttachment(
  messageId: string,
  index: number,
): Promise<MessageAttachment | null> {
  const results = await getCachedAttachmentsBatch([{ messageId, index }])

  return results.get(cacheKey(messageId, index)) ?? null
}

export async function getCachedAttachmentsBatch(
  items: Array<{ messageId: string; index: number }>,
): Promise<Map<string, MessageAttachment>> {
  const results = new Map<string, MessageAttachment>()

  if (items.length === 0) {
    return results
  }

  try {
    const db = await openDb()

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      let pending = items.length

      for (const { messageId, index } of items) {
        const key = cacheKey(messageId, index)
        const request = store.get(key)

        request.onsuccess = () => {
          const record = request.result as CachedAttachmentRecord | undefined

          if (record?.url) {
            results.set(key, {
              url: record.url,
              name: record.name,
              type: record.type,
            })
          }

          pending -= 1

          if (pending === 0) {
            resolve()
          }
        }

        request.onerror = () => reject(request.error)
      }

      tx.onerror = () => reject(tx.error)
    })
  } catch {
    return results
  }

  return results
}

export async function setCachedAttachment(
  messageId: string,
  index: number,
  attachment: MessageAttachment,
): Promise<void> {
  if (!canCacheAttachment(attachment)) {
    return
  }

  try {
    const db = await openDb()
    const record: CachedAttachmentRecord = {
      key: cacheKey(messageId, index),
      messageId,
      index,
      url: attachment.url,
      name: attachment.name,
      type: attachment.type,
      cachedAt: Date.now(),
    }

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const request = tx.objectStore(STORE_NAME).put(record)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch {
    // Ignore quota errors.
  }
}

export async function cacheMessageAttachments(
  messageId: string,
  attachments: MessageAttachment[] = [],
): Promise<void> {
  await Promise.all(
    attachments.map((attachment, index) =>
      setCachedAttachment(messageId, index, attachment),
    ),
  )
}

export function collectAttachmentRefs(messages: Message[]): AttachmentRef[] {
  return messages.flatMap((message) =>
    (message.attachments ?? []).map((metadata, index) => ({
      messageId: message._id,
      index,
      metadata,
    })),
  )
}

export function applyPrefetchedAttachments(messages: Message[]): Message[] {
  return messages.map((message) => {
    if (!message.attachments?.length) {
      return message
    }

    return {
      ...message,
      attachments: message.attachments.map((attachment, index) => {
        const cached = memoryCache.get(getAttachmentMemoryKey(message._id, index))

        if (!cached?.url) {
          return attachment
        }

        return { ...attachment, ...cached }
      }),
    }
  })
}

export async function hydrateMessagesFromAttachmentCache<
  T extends { _id: string; attachments?: MessageAttachment[] },
>(messages: T[]): Promise<T[]> {
  const refs = messages.flatMap((message) =>
    (message.attachments ?? []).map((attachment, index) => ({
      messageId: message._id,
      index,
      attachment,
    })),
  )

  const needsLookup = refs.filter(({ attachment }) => !attachment.url)

  if (needsLookup.length === 0) {
    return messages
  }

  const cachedByKey = await getCachedAttachmentsBatch(
    needsLookup.map(({ messageId, index }) => ({ messageId, index })),
  )

  for (const [key, attachment] of cachedByKey) {
    memoryCache.set(key, attachment)
  }

  return messages.map((message) => {
    if (!message.attachments?.length) {
      return message
    }

    return {
      ...message,
      attachments: message.attachments.map((attachment, index) => {
        if (attachment.url) {
          return attachment
        }

        const cached = memoryCache.get(getAttachmentMemoryKey(message._id, index))

        if (!cached?.url) {
          return attachment
        }

        return { ...attachment, ...cached }
      }),
    }
  })
}

async function fetchAndCacheAttachment(
  messageId: string,
  index: number,
  metadata: MessageAttachment,
): Promise<MessageAttachment> {
  const downloaded = await getMessageAttachment(messageId, index)
  const resolved = { ...metadata, ...downloaded }
  const key = getAttachmentMemoryKey(messageId, index)

  memoryCache.set(key, resolved)
  void setCachedAttachment(messageId, index, resolved)

  return resolved
}

export async function resolveAttachment(
  messageId: string,
  index: number,
  metadata: MessageAttachment,
): Promise<MessageAttachment> {
  const key = getAttachmentMemoryKey(messageId, index)

  if (metadata.url) {
    memoryCache.set(key, metadata)
    void setCachedAttachment(messageId, index, metadata)
    return metadata
  }

  const fromMemory = memoryCache.get(key)

  if (fromMemory?.url) {
    return { ...metadata, ...fromMemory }
  }

  const fromIndexedDb = await getCachedAttachment(messageId, index)

  if (fromIndexedDb?.url) {
    memoryCache.set(key, fromIndexedDb)
    return { ...metadata, ...fromIndexedDb }
  }

  const pending = inflight.get(key)

  if (pending) {
    return pending
  }

  const promise = fetchAndCacheAttachment(messageId, index, metadata)
  inflight.set(key, promise)

  try {
    return await promise
  } finally {
    inflight.delete(key)
  }
}

export async function prefetchAttachments(refs: AttachmentRef[]): Promise<void> {
  const missing = refs.filter(({ messageId, index, metadata }) => {
    const key = getAttachmentMemoryKey(messageId, index)

    return !metadata.url && !memoryCache.get(key)?.url
  })

  if (missing.length === 0) {
    return
  }

  const cachedByKey = await getCachedAttachmentsBatch(
    missing.map(({ messageId, index }) => ({ messageId, index })),
  )

  for (const [key, attachment] of cachedByKey) {
    memoryCache.set(key, attachment)
  }

  const stillMissing = missing.filter(({ messageId, index }) => {
    const key = getAttachmentMemoryKey(messageId, index)
    return !memoryCache.get(key)?.url
  })

  for (const batch of chunk(stillMissing, BATCH_SIZE)) {
    const response = await getMessageAttachmentsBatch(
      batch.map(({ messageId, index }) => ({ messageId, index })),
    )

    await Promise.all(
      response.map(async (item) => {
        if (!item.url) {
          return
        }

        const ref = batch.find(
          (entry) =>
            entry.messageId === item.messageId && entry.index === item.index,
        )

        if (!ref) {
          return
        }

        const resolved = { ...ref.metadata, ...item }
        const key = getAttachmentMemoryKey(item.messageId, item.index)

        memoryCache.set(key, resolved)
        await setCachedAttachment(item.messageId, item.index, resolved)
      }),
    )
  }
}

export async function prefetchRecentAttachments(messages: Message[]): Promise<Message[]> {
  const recentMessages = messages.slice(-12)
  const refs = collectAttachmentRefs(recentMessages)

  await prefetchAttachments(refs)

  return applyPrefetchedAttachments(messages)
}

export type { MessageAttachment }
