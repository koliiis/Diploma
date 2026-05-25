import type { Message } from '../api/messages'

function isLocalOnlyMessage(message: Message): boolean {
  return (
    message.localStatus === 'pending' || message.localStatus === 'failed'
  )
}

/** Keeps pending/failed and out-of-window cache rows; server list is authoritative in-window. */
export function mergeCachedWithServerSnapshot(
  cached: Message[],
  server: Message[],
): Message[] {
  if (server.length === 0) {
    return cached.filter(isLocalOnlyMessage)
  }

  const serverIds = new Set(server.map((m) => m._id))
  const oldestServer = new Date(server[0].createdAt).getTime()
  const newestServer = new Date(server[server.length - 1].createdAt).getTime()

  const cachedToMerge = cached.filter((m) => {
    if (serverIds.has(m._id)) return true
    if (isLocalOnlyMessage(m)) return true

    const createdAt = new Date(m.createdAt).getTime()
    return createdAt < oldestServer || createdAt > newestServer
  })

  return mergeMessagesByIdChronological(cachedToMerge, server)
}

function pickPreferredMessage(existing: Message, incoming: Message): Message {
  const existingAttachments = existing.attachments?.length ?? 0
  const incomingAttachments = incoming.attachments?.length ?? 0

  if (incomingAttachments !== existingAttachments) {
    return incomingAttachments > existingAttachments ? incoming : existing
  }

  return incoming
}

export function mergeMessagesByIdChronological(
  a: Message[],
  b: Message[],
): Message[] {
  const byId = new Map<string, Message>()

  for (const message of a) {
    byId.set(message._id, message)
  }

  for (const message of b) {
    const existing = byId.get(message._id)

    if (!existing) {
      byId.set(message._id, message)
      continue
    }

    byId.set(message._id, pickPreferredMessage(existing, message))
  }

  return Array.from(byId.values()).sort(
    (x, y) =>
      new Date(x.createdAt).getTime() - new Date(y.createdAt).getTime(),
  )
}
