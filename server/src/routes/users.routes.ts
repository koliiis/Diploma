import { Router } from 'express'
import { UserModel } from '../models/user.model'

export const usersRouter = Router()

usersRouter.post('/', async (_req, res) => {
  try {
    const user = await UserModel.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'student',
    })

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

usersRouter.get('/', async (_req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})
