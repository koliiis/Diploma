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