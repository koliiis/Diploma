import { Router } from 'express'
import { MessageModel } from '../models/message.model'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

export const messagesRouter = Router()

messagesRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { chatId, content } = req.body

    if (!chatId || !content) {
      return res.status(400).json({
        error: 'chatId and content are required',
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
      content,
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