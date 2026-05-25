import { getIo } from '../socket/ioInstance'

function normalizeId(value: unknown): string | null {
  if (value == null) {
    return null
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (typeof value !== 'object') {
    return null
  }

  const ctor = (value as { constructor?: { name?: string } }).constructor?.name

  if (ctor === 'ObjectId' || ctor === 'ObjectID') {
    return String(value)
  }

  if ('_id' in value) {
    const inner = (value as { _id: unknown })._id

    if (inner !== value) {
      return normalizeId(inner)
    }
  }

  if (typeof (value as { toString: () => string }).toString === 'function') {
    const asString = (value as { toString: () => string }).toString()

    if (/^[a-f\d]{24}$/i.test(asString)) {
      return asString
    }
  }

  return null
}

function extractChatId(message: Record<string, unknown>): string | null {
  return normalizeId(message.chatId)
}

export function emitNewMessage(message: Record<string, unknown>) {
  const io = getIo()
  const chatId = extractChatId(message)

  if (!io || !chatId) {
    return
  }

  io.to(chatId).emit('new-message', message)
  io.to(chatId).emit('chat-list-updated', { chatId, message })
}

export function emitEditedMessage(message: Record<string, unknown>) {
  const io = getIo()
  const chatId = extractChatId(message)

  if (!io || !chatId) {
    return
  }

  io.to(chatId).emit('message-edited', message)
}

export function emitDeletedMessage(messageId: string, chatId: string) {
  const io = getIo()

  if (!io) {
    return
  }

  io.to(chatId).emit('message-deleted', { messageId, chatId })
}
