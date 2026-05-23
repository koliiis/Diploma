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
  role: 'student' | 'teacher' | 'admin'
  group?: string
  avatarUrl?: string
  isBlocked?: boolean
  blockedAt?: string
}

type AuthState = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: AuthUser, token: string) => void
  isSessionExpired: () => boolean
  logout: () => void
  updateUser: (user: AuthUser) => void
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

export function normalizeAuthUser(user: AuthUser): AuthUser {
  if (user.isBlocked === true) {
    return {
      ...user,
      isBlocked: true,
    }
  }

  return {
    ...user,
    isBlocked: false,
    blockedAt: undefined,
  }
}

type PersistedAuthState = Pick<AuthState, 'token' | 'isAuthenticated'> & {
  user: Omit<AuthUser, 'isBlocked' | 'blockedAt'> | null
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], PersistedAuthState>(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user: normalizeAuthUser(user),
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

      updateUser: (user) =>
        set({
          user: normalizeAuthUser(user),
        }),
    }),
    {
      name: 'campustalk-auth',
      partialize: (state) => ({
        user: state.user
          ? {
              _id: state.user._id,
              fullName: state.user.fullName,
              email: state.user.email,
              role: state.user.role,
              group: state.user.group,
              avatarUrl: state.user.avatarUrl,
            }
          : null,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as PersistedAuthState),
        user: (persisted as PersistedAuthState).user
          ? {
              ...(persisted as PersistedAuthState).user,
              isBlocked: false,
              blockedAt: undefined,
            }
          : null,
      }),
    },
  ),
)
