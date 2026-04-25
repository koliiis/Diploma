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
  const response = await fetch('http://127.0.0.1:4000/api/users')

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  return response.json()
}

export async function createUser(): Promise<User> {
    const response = await fetch('http://127.0.0.1:4000/api/users', {
      method: 'POST',
    })
  
    if (!response.ok) {
      throw new Error('Failed to create user')
    }
  
    return response.json()
  }