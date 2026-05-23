import { NextFunction, Response } from 'express'
import { UserModel } from '../models/user.model'
import { verifyAccessToken } from '../utils/jwt'
import { AuthRequest } from './auth.types'

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]
  const decoded = verifyAccessToken(token)

  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const userDoc = await UserModel.findById(decoded.userId).select('role isBlocked')

    if (!userDoc) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    req.user = {
      userId: decoded.userId,
      role: userDoc.role,
      isBlocked: userDoc.isBlocked === true,
    }

    next()
  } catch {
    return res.status(500).json({ error: 'Failed to authenticate user' })
  }
}
