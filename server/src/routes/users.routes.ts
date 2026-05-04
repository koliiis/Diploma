import { Router } from 'express'
import { UserModel } from '../models/user.model'
import bcrypt from 'bcryptjs'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

export const usersRouter = Router()

usersRouter.post('/', async (_req, res) => {
  try {
    const user = await UserModel.create({
      fullName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      role: 'teacher',
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

usersRouter.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const {
      fullName,
      avatarUrl,
      group,
      currentPassword,
      newPassword,
    } = req.body

    const userDoc = await UserModel.findById(user.userId)

    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (fullName) userDoc.fullName = fullName
    if (avatarUrl) userDoc.avatarUrl = avatarUrl

    if (group && userDoc.role === 'student') {
      userDoc.group = group
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          error: 'Current password required',
        })
      }

      const isMatch = await bcrypt.compare(
        currentPassword,
        userDoc.password,
      )

      if (!isMatch) {
        return res.status(400).json({
          error: 'Wrong current password',
        })
      }

      userDoc.password = await bcrypt.hash(newPassword, 10)
    }

    await userDoc.save()

    res.json({
      _id: userDoc._id,
      fullName: userDoc.fullName,
      email: userDoc.email,
      role: userDoc.role,
      avatarUrl: userDoc.avatarUrl,
      group: userDoc.group,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})