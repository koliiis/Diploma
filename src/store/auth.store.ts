import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UserRole = 'student' | 'teacher'

type User = {
  id: string
  fullName: string
  email: string
  role: UserRole
}

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: () =>
        set({
          user: {
            id: '1',
            fullName: 'Anna Kolisnichenko',
            email: 'anna@example.com',
            role: 'student',
          },
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'campus-talk-auth',
    },
  ),
)