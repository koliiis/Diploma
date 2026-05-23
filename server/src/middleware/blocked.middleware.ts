import { NextFunction, Response } from 'express'
import { UserModel } from '../models/user.model'
import type { AuthRequest } from './auth.types'

export async function rejectIfBlocked(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const userId = req.user?.userId

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const user = await UserModel.findById(userId).select('isBlocked')

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.isBlocked === true) {
      return res.status(403).json({ error: 'User is blocked' })
    }

    next()
  } catch {
    res.status(500).json({ error: 'Failed to verify user status' })
  }
}
