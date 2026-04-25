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
    const response = await fetch('http://127.0.0.1:4000/api/courses')
  
    if (!response.ok) {
      throw new Error('Failed to fetch courses')
    }
  
    return response.json()
  }