import type { Request } from 'express'

export type AuthUserPayload = {
  userId: string
  role: 'student' | 'teacher' | 'admin'
  isBlocked: boolean
}

export type AuthRequest = Request & {
  user?: AuthUserPayload
}
