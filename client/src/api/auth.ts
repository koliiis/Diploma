import { apiRequest } from './client'

export async function login(params: {
  email: string
  password: string
}) {
  return apiRequest<{
    token: string
    user: {
      _id: string
      fullName: string
      email: string
      role: 'student' | 'teacher'
      avatarUrl?: string
      group?: string
    }
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function register(params: {
  fullName: string
  email: string
  password: string
  role: 'student' | 'teacher'
  group?: string
}) {
  return apiRequest<{
    _id: string
    fullName: string
    email: string
    role: 'student' | 'teacher'
    group?: string
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}