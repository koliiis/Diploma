import { API_URL } from '../config/api'

export type UserRole = 'student' | 'teacher'

export type User = {
  _id: string
  fullName: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/users`)

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

export async function createUser(): Promise<User> {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
    })
  
    if (!response.ok) {
      throw new Error('Failed to create user')
    }
  
    return response.json()
  }