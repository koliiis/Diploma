import { getIo } from '../socket/ioInstance'

function extractChatId(message: Record<string, unknown>): string | null {
  const chatId = message.chatId

  if (typeof chatId === 'string') {
    return chatId
  }

  if (
    chatId &&
    typeof chatId === 'object' &&
    '_id' in chatId &&
    typeof chatId._id === 'string'
  ) {
    return chatId._id
  }

  return null
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
