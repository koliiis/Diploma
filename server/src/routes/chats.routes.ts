import { Router } from 'express'
import { ChatModel } from '../models/chat.model'
import { CourseModel } from '../models/course.model'

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

chatsRouter.get('/', async (_req, res) => {
  try {
    const chats = await ChatModel.find()
      .populate('courseId', 'title description')
      .populate('participantIds', 'fullName email role')
      .sort({ createdAt: -1 })

    res.json(chats)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch chats' })
  }
})