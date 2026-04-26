import { apiRequest } from './client'

export type Message = {
  _id: string
  content: string
  createdAt: string
  authorId: {
    _id: string
    fullName: string
    email: string
  }
  chatId: {
    _id: string
    title: string
  }
  localStatus?: 'pending' | 'sent' | 'failed'
}
  
export async function getMessages(chatId?: string): Promise<Message[]> {
  const endpoint = chatId
    ? `/api/messages?chatId=${chatId}`
    : '/api/messages'

  return apiRequest<Message[]>(endpoint)
}

export async function createMessage(params: {
  chatId: string
  content: string
}): Promise<Message> {
  return apiRequest<Message>('/api/messages', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}