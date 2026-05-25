import { Router } from 'express'
import { MessageModel } from '../models/message.model'
import { UserModel } from '../models/user.model'
import { authMiddleware } from '../middleware/auth.middleware'
import type { AuthRequest } from '../middleware/auth.types'
import { rejectIfBlocked } from '../middleware/blocked.middleware'
import { isAdmin } from '../utils/permissions'
import {
  applyMessageCutoffFilter,
  getMessageCutoffDate,
} from '../utils/blockedMessages'
import { validateMessageAttachments } from '../utils/attachmentValidation'
import { encryptMessageFields, decryptMessageText } from '../utils/messageEncryption'
import {
  serializeMessageForResponse,
  serializeMessagesForResponse,
} from '../utils/serializeMessage'
import {
  assertChatParticipant,
  assertMessageAccess,
} from '../utils/chatAccess'
import {
  emitDeletedMessage,
  emitEditedMessage,
  emitNewMessage,
} from '../utils/socketEvents'

export const messagesRouter = Router()

function getRouteParam(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value
}

messagesRouter.post('/', authMiddleware, rejectIfBlocked, async (req: AuthRequest, res) => {
  try {
    const { chatId, content, attachments: rawAttachments = [] } = req.body

    const attachments = Array.isArray(rawAttachments)
      ? rawAttachments.map((a: { url: string; name: string; type?: string }) => ({
          url: a.url,
          name: a.name,
          type: a.type?.trim() || 'application/octet-stream',
        }))
      : []

    if (!chatId || (!content?.trim() && attachments.length === 0)) {
      return res.status(400).json({
        error: 'chatId and content or attachments are required',
      })
    }

    const attachmentError = validateMessageAttachments(attachments)

    if (attachmentError) {
      return res.status(400).json({ error: attachmentError })
    }

    const authorId = req.user?.userId

    if (!authorId) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const access = await assertChatParticipant(authorId, chatId, req.user?.role)

    if (!access.ok) {
      return res.status(access.status).json({ error: access.error })
    }

    const encrypted = encryptMessageFields(content ?? '', attachments)

    const message = await MessageModel.create({
      chatId,
      authorId,
      content: encrypted.content,
      attachments: encrypted.attachments,
      readByIds: [authorId],
    })

    const populatedMessage = await MessageModel.findById(message._id)
      .populate('authorId', 'fullName email avatarUrl')
      .populate('chatId', 'title')

    const serialized = serializeMessageForResponse(populatedMessage)
    const socketPayload = serializeMessageForResponse(populatedMessage, {
      includeAttachmentData: false,
    })

    if (socketPayload) {
      emitNewMessage(socketPayload as Record<string, unknown>)
    }

    res.json(serialized)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create message' })
  }
})

messagesRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { chatId, before, limit = '30' } = req.query
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({
        error: 'chatId is required',
      })
    }

    if (before && typeof before !== 'string') {
      return res.status(400).json({
        error: 'before must be a string',
      })
    }

    const access = await assertChatParticipant(userId, chatId, req.user?.role)

    if (!access.ok) {
      return res.status(access.status).json({ error: access.error })
    }

    const parsedLimit = Math.min(Number(limit) || 30, 50)

    const filter: {
      chatId: string
      createdAt?: Record<string, Date>
    } = {
      chatId,
    }

    if (before) {
      filter.createdAt = {
        $lt: new Date(before),
      }
    }

    const userDoc = await UserModel.findById(userId).select(
      'isBlocked blockedAt updatedAt',
    )

    if (userDoc) {
      applyMessageCutoffFilter(filter, getMessageCutoffDate(userDoc))
    }

    const includeAttachments = req.query.includeAttachments === 'true'

    const messages = await MessageModel.find(filter)
      .populate('authorId', 'fullName email avatarUrl')
      .populate('chatId', 'title')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)

    res.json(
      serializeMessagesForResponse(messages.reverse(), {
        includeAttachmentData: includeAttachments,
      }),
    )
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

messagesRouter.post('/attachments/batch', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { items } = req.body as {
      items?: Array<{ messageId: string; index: number }>
    }
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' })
    }

    if (items.length > 20) {
      return res.status(400).json({ error: 'Maximum 20 attachments per batch' })
    }

    for (const item of items) {
      if (
        !item?.messageId ||
        !Number.isInteger(item.index) ||
        item.index < 0
      ) {
        return res.status(400).json({ error: 'Invalid attachment reference' })
      }
    }

    const messageIds = [...new Set(items.map((item) => item.messageId))]
    const messages = await MessageModel.find({ _id: { $in: messageIds } }).select(
      'chatId attachments',
    )
    const messagesById = new Map(
      messages.map((message) => [message._id.toString(), message]),
    )

    for (const messageId of messageIds) {
      const message = messagesById.get(messageId)

      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }

      const access = await assertChatParticipant(
        userId,
        message.chatId.toString(),
        req.user?.role,
      )

      if (!access.ok) {
        return res.status(access.status).json({ error: access.error })
      }
    }

    const attachments = items.map(({ messageId, index }) => {
      const message = messagesById.get(messageId)
      const attachment = message?.attachments?.[index]

      if (!attachment) {
        return {
          messageId,
          index,
          name: '',
          type: 'application/octet-stream',
        }
      }

      return {
        messageId,
        index,
        url: decryptMessageText(attachment.url),
        name: attachment.name,
        type: attachment.type,
      }
    })

    res.json({ attachments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch attachments' })
  }
})

messagesRouter.get(
  '/:messageId/attachments/:index',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { messageId: messageIdParam } = req.params
      const messageId = getRouteParam(messageIdParam)
      const index = Number(req.params.index)
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!Number.isInteger(index) || index < 0) {
        return res.status(400).json({ error: 'Invalid attachment index' })
      }

      const access = await assertMessageAccess(userId, messageId, req.user?.role)

      if (!access.ok) {
        return res.status(access.status).json({ error: access.error })
      }

      const message = await MessageModel.findById(messageId).select('attachments')

      if (!message?.attachments?.[index]) {
        return res.status(404).json({ error: 'Attachment not found' })
      }

      const attachment = message.attachments[index]

      res.json({
        url: decryptMessageText(attachment.url),
        name: attachment.name,
        type: attachment.type,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to fetch attachment' })
    }
  },
)

messagesRouter.patch(
  '/read/:chatId',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { chatId: chatIdParam } = req.params
      const chatId = getRouteParam(chatIdParam)
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const access = await assertChatParticipant(userId, chatId, req.user?.role)

      if (!access.ok) {
        return res.status(access.status).json({ error: access.error })
      }

      await MessageModel.updateMany(
        {
          chatId,
          readByIds: { $ne: userId },
        },
        {
          $addToSet: {
            readByIds: userId,
          },
        },
      )

      res.json({ ok: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to mark messages as read' })
    }
  },
)

messagesRouter.patch(
  '/:messageId',
  authMiddleware,
  rejectIfBlocked,
  async (req: AuthRequest, res) => {
    try {
      const { messageId: messageIdParam } = req.params
      const messageId = getRouteParam(messageIdParam)
      const { content } = req.body
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!content?.trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }

      const access = await assertMessageAccess(userId, messageId, req.user?.role)

      if (!access.ok) {
        return res.status(access.status).json({ error: access.error })
      }

      const message = await MessageModel.findById(messageId)

      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }

      if (message.authorId.toString() !== userId && !isAdmin(req.user?.role)) {
        return res.status(403).json({ error: 'You can edit only your own messages' })
      }

      message.content = encryptMessageFields(content.trim(), []).content
      await message.save()

      const populatedMessage = await MessageModel.findById(message._id)
        .populate('authorId', 'fullName email avatarUrl')
        .populate('chatId', 'title')

      const serialized = serializeMessageForResponse(populatedMessage)
      const socketPayload = serializeMessageForResponse(populatedMessage, {
        includeAttachmentData: false,
      })

      if (socketPayload) {
        emitEditedMessage(socketPayload as Record<string, unknown>)
      }

      res.json(serialized)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to update message' })
    }
  },
)

messagesRouter.delete(
  '/:messageId',
  authMiddleware,
  rejectIfBlocked,
  async (req: AuthRequest, res) => {
    try {
      const { messageId: messageIdParam } = req.params
      const messageId = getRouteParam(messageIdParam)
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const access = await assertMessageAccess(userId, messageId, req.user?.role)

      if (!access.ok) {
        return res.status(access.status).json({ error: access.error })
      }

      const message = await MessageModel.findById(messageId)

      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }

      const isAuthor = message.authorId.toString() === userId

      if (!isAuthor && !isAdmin(req.user?.role)) {
        return res.status(403).json({
          error: 'You can delete only your own messages',
        })
      }

      const chatId = message.chatId.toString()

      await message.deleteOne()

      emitDeletedMessage(messageId, chatId)

      res.json({ ok: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to delete message' })
    }
  },
)
