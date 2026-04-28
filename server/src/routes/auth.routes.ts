import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { UserModel } from '../models/user.model'
import jwt from 'jsonwebtoken'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, group } = req.body

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        error: 'All fields are required',
      })
    }
    
    if (role === 'student' && !group) {
      return res.status(400).json({
        error: 'Group is required for students',
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
      role,
      group: role === 'student' ? group : undefined,
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

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return res.status(500).json({
        error: 'JWT_SECRET is not configured',
      })
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: '7d',
      },
    )

    res.json({
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl || undefined,
        group: user.group || undefined,
      },
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to login' })
  }
})