import { Router } from 'express'
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware'
import { ChatModel } from '../models/chat.model'
import { MessageModel } from '../models/message.model'
import { UserModel } from '../models/user.model'
import { isAdmin } from '../utils/permissions'
import {
  applyMessageCutoffFilter,
  getMessageCutoffDate,
} from '../utils/blockedMessages'
import { serializeMessageForResponse } from '../utils/serializeMessage'

export const chatsRouter = Router()

chatsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const chats = await ChatModel.find(
      isAdmin(user.role) ? {} : { participantIds: user.userId },
    )
      .populate('courseId', 'title description groups imageUrl')
      .populate('participantIds', 'fullName email role avatarUrl')
      .sort({ createdAt: -1 })

    const userDoc = await UserModel.findById(user.userId).select(
      'isBlocked blockedAt updatedAt',
    )
    const messageCutoff = userDoc ? getMessageCutoffDate(userDoc) : null

    const result = await Promise.all(
      chats.map(async (chat) => {
        const unreadFilter: {
          chatId: typeof chat._id
          authorId: { $ne: string }
          readByIds: { $ne: string }
          createdAt?: Record<string, Date>
        } = {
          chatId: chat._id,
          authorId: { $ne: user.userId },
          readByIds: { $ne: user.userId },
        }

        applyMessageCutoffFilter(unreadFilter, messageCutoff)

        const unreadCount = await MessageModel.countDocuments(unreadFilter)

        const lastMessageFilter: {
          chatId: typeof chat._id
          createdAt?: Record<string, Date>
        } = {
          chatId: chat._id,
        }

        applyMessageCutoffFilter(lastMessageFilter, messageCutoff)

        const lastMessage = await MessageModel.findOne(lastMessageFilter)
          .sort({ createdAt: -1 })
          .populate('authorId', 'fullName email avatarUrl')

        return {
          ...chat.toObject(),
          unreadCount,
          lastMessage: serializeMessageForResponse(lastMessage, {
            includeAttachmentData: false,
          }),
          lastMessageAt: lastMessage?.createdAt ?? chat.createdAt,
        }
      }),
    )

    result.sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime(),
    )

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch chats' })
  }
})

chatsRouter.post('/direct/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUser = req.user
    const userIdParam = req.params.userId
    const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const teacher = await UserModel.findById(userId)

    if (!teacher) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (currentUser.userId === userId) {
      return res.status(400).json({ error: 'You cannot create chat with yourself' })
    }

    const existingChat = await ChatModel.findOne({
      type: 'direct',
      participantIds: {
        $all: [currentUser.userId, userId],
      },
    })

    if (existingChat) {
      return res.json(existingChat)
    }

    const chat = await ChatModel.create({
      title: `Приватні повідомлення з ${teacher.fullName}`,
      type: 'direct',
      participantIds: [currentUser.userId, userId],
    })

    res.json(chat)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create direct chat' })
  }
})

chatsRouter.patch('/:chatId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params
    const { title } = req.body
    const user = req.user

    if (!user || !isAdmin(user.role)) {
      return res.status(403).json({ error: 'Admin access only' })
    }

    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' })
    }

    const chat = await ChatModel.findById(chatId)

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    chat.title = title.trim()
    await chat.save()

    res.json(chat)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update chat' })
  }
})

chatsRouter.delete('/:chatId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { chatId } = req.params
    const user = req.user

    if (!user || !isAdmin(user.role)) {
      return res.status(403).json({ error: 'Admin access only' })
    }

    const chat = await ChatModel.findById(chatId)

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' })
    }

    await MessageModel.deleteMany({ chatId: chat._id })
    await chat.deleteOne()

    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete chat' })
  }
})