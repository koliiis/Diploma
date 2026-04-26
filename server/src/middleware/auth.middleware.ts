import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

type JwtPayload = {
  userId: string
  role: 'student' | 'teacher'
}

export type AuthRequest = Request & {
  user?: JwtPayload
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.split(' ')[1]
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}