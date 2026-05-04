import type { AuthUser } from '../store/authStore'
import { apiRequest } from './client'

export type UserRole = 'student' | 'teacher'

export type User = {
  _id: string
  fullName: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  group?: string
}

export async function getUsers(): Promise<User[]> {
  return apiRequest<User[]>('/api/users')
}

export async function createUser(): Promise<User> {
  return apiRequest<User>('/api/users', {
    method: 'POST',
  })
}

export async function updateProfile(params: {
  fullName?: string
  avatarUrl?: string
  group?: string
  currentPassword?: string
  newPassword?: string
}): Promise<AuthUser> {
  return apiRequest<AuthUser>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}