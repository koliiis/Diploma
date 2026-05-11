import { Router } from 'express'
import { ChatModel } from '../models/chat.model'
import { CourseModel } from '../models/course.model'
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware'
import { UserModel } from '../models/user.model'
import { MessageModel } from '../models/message.model'

export const chatsRouter = Router()

chatsRouter.post('/', async (_req, res) => {
  try {
    const course = await CourseModel.findOne().sort({ createdAt: -1 })

    if (!course) {
      return res.status(400).json({
        error: 'Create a course first',
      })
    }

    const participantIds = [
      course.teacherId,
      ...course.studentIds,
    ]

    const chat = await ChatModel.create({
      title: `${course.title} Chat`,
      type: 'course',
      courseId: course._id,
      participantIds,
    })

    res.json(chat)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create chat' })
  }
})

chatsRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const chats = await ChatModel.find({
      participantIds: user.userId,
    })
      .populate('courseId', 'title description groups imageUrl')
      .populate('participantIds', 'fullName email role avatarUrl')
      .sort({ createdAt: -1 })

    const result = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await MessageModel.countDocuments({
          chatId: chat._id,
          authorId: { $ne: user.userId },
          readByIds: { $ne: user.userId },
        })

        const lastMessage = await MessageModel.findOne({
          chatId: chat._id,
        })
          .sort({ createdAt: -1 })
          .populate('authorId', 'fullName email avatarUrl')
    
        return {
          ...chat.toObject(),
          unreadCount,
          lastMessage,
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