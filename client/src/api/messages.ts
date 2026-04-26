import { apiRequest } from './client'

export type Message = {
  _id: string
  content: string
  createdAt: string
  authorId: {
    _id: string
    fullName: string
    email: string
    avatarUrl?: string
  }
  chatId: {
    _id: string
    title: string
  }
  localStatus?: 'pending' | 'sent' | 'failed'
}

export async function getMessages(params?: {
  chatId?: string
  before?: string
  limit?: number
}): Promise<Message[]> {
  const searchParams = new URLSearchParams()

  if (params?.chatId) {
    searchParams.set('chatId', params.chatId)
  }

  if (params?.before) {
    searchParams.set('before', params.before)
  }

  if (params?.limit) {
    searchParams.set('limit', String(params.limit))
  }

  const query = searchParams.toString()
  const endpoint = query ? `/api/messages?${query}` : '/api/messages'

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