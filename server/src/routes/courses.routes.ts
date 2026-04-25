import { Router } from 'express'
import { CourseModel } from '../models/course.model'
import { UserModel } from '../models/user.model'

export const coursesRouter = Router()

coursesRouter.post('/', async (_req, res) => {
  try {
    const teacher = await UserModel.findOne({ role: 'teacher' })

    if (!teacher) {
      return res.status(400).json({
        error: 'Create a teacher user first',
      })
    }

    const course = await CourseModel.create({
      title: `Web Development ${Date.now()}`,
      description: 'Course about modern web development',
      teacherId: teacher._id,
      studentIds: [],
    })

    res.json(course)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create course' })
  }
})

coursesRouter.get('/', async (_req, res) => {
  try {
    const courses = await CourseModel.find()
      .populate('teacherId', 'fullName email role')
      .sort({ createdAt: -1 })

    res.json(courses)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch courses' })
  }
})