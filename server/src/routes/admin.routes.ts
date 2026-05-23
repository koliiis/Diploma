import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { UserModel } from '../models/user.model'
import { authMiddleware } from '../middleware/auth.middleware'
import { adminMiddleware } from '../middleware/admin.middleware'
import type { AuthRequest } from '../middleware/auth.types'

export const adminRouter = Router()

adminRouter.use(authMiddleware)
adminRouter.use(adminMiddleware)

adminRouter.get('/users', async (_req, res) => {
  const users = await UserModel.find()
    .select('-password')
    .sort({ createdAt: -1 })

  res.json(users)
})

adminRouter.post('/users', async (req, res) => {
  try {
    const { fullName, email, password, role, group } = req.body

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ error: 'fullName, email, password and role are required' })
    }

    if (!['student', 'teacher', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    if (role === 'student' && !group) {
      return res.status(400).json({ error: 'Group is required for students' })
    }

    const existingUser = await UserModel.findOne({ email })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      group: role === 'student' ? group : undefined,
      isBlocked: false,
    })

    const userObject = user.toObject()
    delete (userObject as any).password

    res.json(userObject)
  } catch {
    res.status(500).json({ error: 'Failed to create user' })
  }
})

adminRouter.patch('/users/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params
    const { fullName, email, role, group, isBlocked, password } = req.body

    if (req.user?.userId === userId && isBlocked) {
      return res.status(400).json({ error: 'Admin cannot block themselves' })
    }

    const user = await UserModel.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (email !== undefined) {
      const trimmedEmail = String(email).trim().toLowerCase()

      if (!trimmedEmail) {
        return res.status(400).json({ error: 'Email is required' })
      }

      const existingUser = await UserModel.findOne({
        email: trimmedEmail,
        _id: { $ne: userId },
      })

      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' })
      }

      user.email = trimmedEmail
    }

    if (fullName !== undefined) user.fullName = fullName
    if (role !== undefined) {
      if (!['student', 'teacher', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' })
      }

      user.role = role
    }

    const effectiveRole = role ?? user.role

    if (group !== undefined) {
      user.group = effectiveRole === 'student' ? group : undefined
    } else if (role !== undefined && role !== 'student') {
      user.group = undefined
    }

    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked === true

      if (user.isBlocked) {
        user.blockedAt = new Date()
      } else {
        user.set('blockedAt', null)
      }
    }

    if (password !== undefined && String(password).trim()) {
      const trimmedPassword = String(password).trim()

      if (trimmedPassword.length < 8 || !/\d/.test(trimmedPassword)) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters and contain a digit',
        })
      }

      user.password = await bcrypt.hash(trimmedPassword, 10)
    }

    await user.save()

    const updatedUser = await UserModel.findById(userId).select('-password')

    res.json(updatedUser)
  } catch {
    res.status(500).json({ error: 'Failed to update user' })
  }
})

adminRouter.delete('/users/:userId', async (req: AuthRequest, res) => {
  try {
    const { userId } = req.params

    if (req.user?.userId === userId) {
      return res.status(400).json({ error: 'Admin cannot delete themselves' })
    }

    await UserModel.findByIdAndDelete(userId)

    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete user' })
  }
})