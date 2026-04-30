import { Router } from 'express'
import { CourseModel } from '../models/course.model'
import { ChatModel } from '../models/chat.model'
import { authMiddleware, type AuthRequest } from '../middleware/auth.middleware'

export const coursesRouter = Router()

coursesRouter.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { title, description, groups, imageUrl } = req.body

    if (!title || !description || !groups || groups.length === 0) {
      return res.status(400).json({
        error: 'title, description and groups are required',
      })
    }

    const groupRegex = /^[А-ЯІЇЄҐ]{2}-\d{2}$/

    const isValidGroups = groups.every((g: string) =>
      groupRegex.test(g),
    )

    if (!isValidGroups) {
      return res.status(400).json({
        error: 'Invalid group format (e.g. TR-25)',
      })
    }

    const user = req.user

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({
        error: 'Only teachers can create courses',
      })
    }

    const course = await CourseModel.create({
      title,
      description,
      groups,
      imageUrl,
      teacherId: user.userId,
      studentIds: [],
    })
    
    await ChatModel.create({
      title,
      type: 'course',
      courseId: course._id,
      participantIds: [user.userId],
    })

    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

coursesRouter.post('/:courseId/join', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.params
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const course = await CourseModel.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    const alreadyJoined = course.studentIds.some(
      (studentId) => studentId.toString() === user.userId,
    )
    
    if (!alreadyJoined && user.role === 'student') {
      course.studentIds.push(user.userId as any)
      await course.save()
    }

    const chat = await ChatModel.findOne({
      courseId: course._id,
      type: 'course',
    })
    
    if (chat) {
      const alreadyInChat = chat.participantIds.some(
        (participantId) => participantId.toString() === user.userId,
      )
    
      if (!alreadyInChat) {
        chat.participantIds.push(user.userId as any)
        await chat.save()
      }
    }

    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to join course' })
  }
})

coursesRouter.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user

    const courses = await CourseModel.find()
      .populate('teacherId', 'fullName email')

      const result = await Promise.all(
        courses.map(async (course) => {
          const chat = await ChatModel.findOne({
            courseId: course._id,
            type: 'course',
          }).populate('participantIds', 'fullName email role avatarUrl')
      
          const isCourseOwner = course.teacherId._id.toString() === user?.userId

          const isStudentJoined = course.studentIds.some(
            (id) => id.toString() === user?.userId,
          )

          const isChatParticipant = chat?.participantIds.some((participant: any) => {
            const participantId = participant._id
              ? participant._id.toString()
              : participant.toString()
          
            return participantId === user?.userId
          })

          const isJoined = isCourseOwner || isStudentJoined || isChatParticipant
      
          const membersCount = chat?.participantIds.length ?? course.studentIds.length + 1
      
          return {
            ...course.toObject(),
            isJoined,
            membersCount,
            chatId: chat?._id,
            participants: chat?.participantIds ?? [],
          }
        }),
      )

    res.json(result)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})

coursesRouter.patch('/:courseId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.params
    const { title, description, groups, imageUrl } = req.body

    const user = req.user

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can edit courses' })
    }

    const course = await CourseModel.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    if (course.teacherId.toString() !== user.userId) {
      return res.status(403).json({ error: 'You can edit only your own courses' })
    }

    if (groups) {
      const groupRegex = /^[А-ЯІЇЄҐ]{2}-\d{2}$/

      const isValidGroups =
        Array.isArray(groups) &&
        groups.length > 0 &&
        groups.every((g: string) => groupRegex.test(g))

      if (!isValidGroups) {
        return res.status(400).json({
          error: 'Invalid group format',
        })
      }
    }

    course.title = title ?? course.title
    course.description = description ?? course.description
    course.groups = groups ?? course.groups
    course.imageUrl = imageUrl ?? course.imageUrl

    await course.save()

    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update course' })
  }
})

coursesRouter.delete('/:courseId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { courseId } = req.params
    const user = req.user

    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can delete courses' })
    }

    const course = await CourseModel.findById(courseId)

    if (!course) {
      return res.status(404).json({ error: 'Course not found' })
    }

    if (course.teacherId.toString() !== user.userId) {
      return res.status(403).json({ error: 'You can delete only your own courses' })
    }

    await course.deleteOne()

    res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to delete course' })
  }
})