import mongoose from 'mongoose'
import { ChatModel } from '../models/chat.model'
import { MessageModel } from '../models/message.model'
import { isAdmin } from './permissions'

export async function isChatParticipant(
  userId: string,
  chatId: string,
  role?: string,
): Promise<boolean> {
  if (isAdmin(role)) {
    return true
  }

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return false
  }

  const chat = await ChatModel.findById(chatId).select('participantIds')

  if (!chat) {
    return false
  }

  return chat.participantIds.some((participantId) => participantId.toString() === userId)
}

export async function assertChatParticipant(
  userId: string,
  chatId: string,
  role?: string,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    return { ok: false, status: 400, error: 'Invalid chatId' }
  }

  const allowed = await isChatParticipant(userId, chatId, role)

  if (!allowed) {
    return {
      ok: false,
      status: 403,
      error: 'You are not a participant of this chat',
    }
  }

  return { ok: true }
}

export async function assertMessageAccess(
  userId: string,
  messageId: string,
  role?: string,
): Promise<
  { ok: true; chatId: string } | { ok: false; status: number; error: string }
> {
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return { ok: false, status: 400, error: 'Invalid messageId' }
  }

  const message = await MessageModel.findById(messageId).select('chatId')

  if (!message) {
    return { ok: false, status: 404, error: 'Message not found' }
  }

  const chatId = message.chatId.toString()
  const access = await assertChatParticipant(userId, chatId, role)

  if (!access.ok) {
    return access
  }

  return { ok: true, chatId }
}
