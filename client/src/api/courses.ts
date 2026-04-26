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
}
  
export async function getCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/api/courses')
}