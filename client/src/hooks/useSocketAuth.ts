import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { connectSocket, disconnectSocket } from '../socket'

export function useSocketAuth() {
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    if (token) {
      connectSocket(token)
    } else {
      disconnectSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [token])
}
