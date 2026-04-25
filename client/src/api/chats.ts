import { API_URL } from '../config/api'

export type Chat = {
  _id: string
  title: string
  type: 'course' | 'direct'
  courseId?: {
    _id: string
    title: string
    description: string
  }
  participantIds: {
    _id: string
    fullName: string
    email: string
    role: string
  }[]
  createdAt: string
  updatedAt: string
}

export async function getChats(): Promise<Chat[]> {
    const response = await fetch(`${API_URL}/api/chats`)
  
    if (!response.ok) {
      throw new Error('Failed to fetch chats')
    }
  
    return response.json()
  }