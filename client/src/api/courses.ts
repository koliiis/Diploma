import { API_URL } from '../config/api'

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
    const response = await fetch(`${API_URL}/api/courses`)
  
    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }
  
    return response.json()
  }