import type { Message } from '../api/messages'

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
