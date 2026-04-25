import { Router } from 'express'
import { MessageModel } from '../models/message.model'
import { UserModel } from '../models/user.model'

export const messagesRouter = Router()

messagesRouter.post('/', async (req, res) => {
  try {
    const { chatId, content } = req.body

    if (!chatId || !content) {
      return res.status(400).json({
        error: 'chatId and content are required',
      })
    }

    const author = await UserModel.findOne()

    if (!author) {
      return res.status(400).json({
        error: 'Create a user first',
      })
    }

    const message = await MessageModel.create({
      chatId,
      authorId: author._id,
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
      const chatId = req.query.chatId
  
      if (chatId && typeof chatId !== 'string') {
        return res.status(400).json({
          error: 'chatId must be a string',
        })
      }
  
      const filter = chatId ? { chatId } : {}
  
      const messages = await MessageModel.find(filter)
        .populate('authorId', 'fullName email')
        .populate('chatId', 'title')
        .sort({ createdAt: 1 })
  
      res.json(messages)
    } catch (error) {
      console.error(error)
      res.status(500).json({ error: 'Failed to fetch messages' })
    }
  })