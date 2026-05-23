import { API_URL } from '../config/api'
import { MAX_FILE_SIZE_LABEL } from '../config/uploads'
import { useAuthStore } from '../store/authStore'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = useAuthStore.getState().token

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (response.status === 401) {
    useAuthStore.getState().logout()
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    let message = `API request failed: ${endpoint}`

    try {
      const body = await response.json()

      if (typeof body?.error === 'string') {
        message = body.error
      }
    } catch {
      if (response.status === 413) {
        message = `Файл занадто великий. Максимальний розмір: ${MAX_FILE_SIZE_LABEL}`
      }
    }

    throw new ApiError(message, response.status)
  }

  return response.json()
}
