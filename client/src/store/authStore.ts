import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

type JwtPayload = {
  exp?: number
}

export type AuthUser = {
  _id: string
  fullName: string
  email: string
  role: 'student' | 'teacher'
  group?: string
  avatarUrl?: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  isSessionExpired: () => boolean
  logout: () => void
}

function isTokenExpired(token: string | null): boolean {
  if (!token) return true

  try {
    const decoded = jwtDecode<JwtPayload>(token)

    if (!decoded.exp) return true

    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      isSessionExpired: (): boolean => {
        return isTokenExpired(get().token)
      },

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'campustalk-auth',
    },
  ),
)