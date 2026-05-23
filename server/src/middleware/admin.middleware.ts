import type { Response, NextFunction } from 'express'
import type { AuthRequest } from './auth.types'

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access only' })
  }

  next()
}