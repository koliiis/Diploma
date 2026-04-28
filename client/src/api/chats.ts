import { apiRequest } from './client'

export type Chat = {
  _id: string
  title: string
  type: 'course' | 'direct'
  courseId?: {
    _id: string
    title: string
    description: string
    group?: string
    imageUrl?: string
  }
  participantIds: {
    _id: string
    fullName: string
    email: string
    role: string
    avatarUrl?: string
  }[]
  createdAt: string
  updatedAt: string
}

export async function getChats(): Promise<Chat[]> {
  return apiRequest<Chat[]>('/api/chats')
}

export async function createDirectChat(userId: string): Promise<Chat> {
  return apiRequest<Chat>(`/api/chats/direct/${userId}`, {
    method: 'POST',
  })
}
