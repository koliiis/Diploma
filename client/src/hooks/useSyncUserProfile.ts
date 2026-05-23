import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getMyProfile } from '../api/users'
import {
  normalizeAuthUser,
  useAuthStore,
  type AuthUser,
} from '../store/authStore'

export function useSyncUserProfile() {
  const updateUser = useAuthStore((s) => s.updateUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  const syncProfile = useCallback(async () => {
    if (!useAuthStore.getState().isAuthenticated) return

    try {
      const profile = normalizeAuthUser(await getMyProfile())
      updateUser(profile)
    } catch {
      // Keep cached profile if sync fails (e.g. offline).
    }
  }, [updateUser])

  useEffect(() => {
    if (!isAuthenticated) return

    void syncProfile()
  }, [isAuthenticated, location.pathname, syncProfile])

  useEffect(() => {
    if (!isAuthenticated) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncProfile()
      }
    }

    const handleFocus = () => {
      void syncProfile()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated, syncProfile])
}

export async function refreshAuthUserProfile(): Promise<AuthUser | null> {
  if (!useAuthStore.getState().isAuthenticated) return null

  const profile = normalizeAuthUser(await getMyProfile())
  useAuthStore.getState().updateUser(profile)
  return profile
}
