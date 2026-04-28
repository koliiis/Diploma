import { apiRequest } from './client'

export type Course = {
  _id: string
  title: string
  description: string
  teacherId: {
    _id: string
    fullName: string
    email: string
    role: string
  }
  createdAt: string
  updatedAt: string
  group: string
  imageUrl?: string
  isJoined?: boolean
  membersCount?: number
  chatId?: string
}
  
export async function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/api/courses')
}

export async function createCourse(params: {
  title: string
  description: string
  group: string
  imageUrl?: string
}): Promise<Course> {
  return apiRequest<Course>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function updateCourse(
  courseId: string,
  params: {
    title: string
    description: string
    group: string
    imageUrl?: string
  },
): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}`, {
    method: 'PATCH',
    body: JSON.stringify(params),
  })
}

export async function deleteCourse(courseId: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/courses/${courseId}`, {
    method: 'DELETE',
  })
}

export async function joinCourse(courseId: string): Promise<Course> {
  return apiRequest<Course>(`/api/courses/${courseId}/join`, {
    method: 'POST',
  })
}