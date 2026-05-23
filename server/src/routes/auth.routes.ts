import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { UserModel } from '../models/user.model'
import { signAccessToken } from '../utils/jwt'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, group } = req.body

    if (!fullName || !email || !password || !group) {
      return res.status(400).json({
        error: 'All fields are required',
      })
    }

    const existingUser = await UserModel.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await UserModel.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      group,
    })

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      group: user.group || undefined,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to register user' })
  }
})

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      })
    }

    const user = await UserModel.findOne({ email })

    if (!user) {
      return res.status(400).json({
        error: 'Invalid email or password',
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({
        error: 'Invalid email or password',
      })
    }

    if (user.isBlocked) {
      return res.status(403).json({
        error: 'User is blocked',
      })
    }

    const token = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    })

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
        group: user.group || undefined,
        isBlocked: user.isBlocked,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to login' })
  }
})
