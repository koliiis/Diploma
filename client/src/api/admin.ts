import { apiRequest } from './client'

export type AdminUserRole = 'student' | 'teacher' | 'admin'

export type AdminUser = {
  _id: string
  fullName: string
  email: string
  role: AdminUserRole
  isBlocked: boolean
  avatarUrl?: string
  group?: string
  createdAt: string
  updatedAt: string
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>('/api/admin/users')
}

export async function createAdminUser(params: {
  fullName: string
  email: string
  password: string
  role: AdminUserRole
  group?: string
}): Promise<AdminUser> {
  return apiRequest<AdminUser>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function updateAdminUser(
  userId: string,
  params: {
    fullName?: string
    email?: string
    role?: AdminUserRole
    group?: string
    isBlocked?: boolean
    password?: string
  },
): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}

export async function deleteAdminUser(userId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
}
