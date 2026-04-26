import { apiRequest } from './client'

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
  return apiRequest<Chat[]>('/api/chats')
}