import { API_URL } from '../config/api'

type RequestOptions = RequestInit

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${endpoint}`)
  }

  return response.json()
}