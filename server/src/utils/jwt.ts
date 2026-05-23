import jwt from 'jsonwebtoken'

type JwtPayload = {
  userId: string
  role?: string
}

export function verifyAccessToken(token: string): JwtPayload | null {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return null
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload

    if (!decoded.userId) {
      return null
    }

    return decoded
  } catch {
    return null
  }
}

export function signAccessToken(payload: {
  userId: string
  role: string
}): string {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' })
}
