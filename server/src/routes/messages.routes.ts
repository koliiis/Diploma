import { Router } from 'express'
import { MessageModel } from '../models/message.model'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

export const messagesRouter = Router()

messagesRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
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

    const authorId = req.user?.userId

    if (!authorId) {
      return res.status(401).json({
        error: 'Unauthorized',
      })
    }

    const message = await MessageModel.create({
      chatId,
      authorId,
      content: content ?? '',
      attachments,
      readByIds: [authorId],
    })

    const populatedMessage = await MessageModel.findById(message._id)
      .populate('authorId', 'fullName email')
      .populate('chatId', 'title')

    res.json(populatedMessage)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create message' })
  }
})

messagesRouter.get('/', async (req, res) => {
  try {
    const { chatId, before, limit = '30' } = req.query

    if (chatId && typeof chatId !== 'string') {
      return res.status(400).json({
        error: 'chatId must be a string',
      })
    }

    if (before && typeof before !== 'string') {
      return res.status(400).json({
        error: 'before must be a string',
      })
    }

    const parsedLimit = Math.min(Number(limit) || 30, 50)

    const filter: {
      chatId?: string
      createdAt?: { $lt: Date }
    } = {}

    if (chatId) {
      filter.chatId = chatId
    }

    if (before) {
      filter.createdAt = {
        $lt: new Date(before),
      }
    }

    const messages = await MessageModel.find(filter)
      .populate('authorId', 'fullName email avatarUrl')
      .populate('chatId', 'title')
      .sort({ createdAt: -1 })
      .limit(parsedLimit)

    res.json(messages.reverse())
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

messagesRouter.patch(
  '/read/:chatId',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { chatId } = req.params
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
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
  async (req: AuthRequest, res) => {
    try {
      const { messageId } = req.params
      const { content } = req.body
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      if (!content?.trim()) {
        return res.status(400).json({ error: 'Content is required' })
      }

      const message = await MessageModel.findById(messageId)

      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }

      if (message.authorId.toString() !== userId) {
        return res.status(403).json({ error: 'You can edit only your own messages' })
      }

      message.content = content.trim()
      await message.save()

      const populatedMessage = await MessageModel.findById(message._id)
        .populate('authorId', 'fullName email avatarUrl')
        .populate('chatId', 'title')

      res.json(populatedMessage)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to update message' })
    }
  },
)

messagesRouter.delete(
  '/:messageId',
  authMiddleware,
  async (req: AuthRequest, res) => {
    try {
      const { messageId } = req.params
      const userId = req.user?.userId

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const message = await MessageModel.findById(messageId)

      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }

      if (message.authorId.toString() !== userId) {
        return res.status(403).json({ error: 'You can delete only your own messages' })
      }

      await message.deleteOne()

      res.json({ ok: true })
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to delete message' })
    }
  },
)