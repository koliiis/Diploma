import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

type JwtPayload = {
  exp?: number
}

type User = {
  _id: string
  fullName: string
  email: string
  role: 'student' | 'teacher'
  group?: string
  avatarUrl?: string
  group?: string
}

type AuthState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  isSessionExpired: () => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState>(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
        }),

      isSessionExpired: () => {
        const token = useAuthStore.getState().token
      
        if (!token) return true
      
        try {
          const decoded = jwtDecode<JwtPayload>(token)
      
          if (!decoded.exp) return true
      
          return decoded.exp * 1000 < Date.now()
        } catch {
          return true
        }
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