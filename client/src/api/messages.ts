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
  attachments?: MessageAttachment[]
}

export type MessageAttachment = {
  url?: string
  name: string
  type: string
}

export async function getMessages(params?: {
  chatId?: string
  before?: string
  limit?: number
  includeAttachments?: boolean
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

  if (params?.includeAttachments) {
    searchParams.set('includeAttachments', 'true')
  }

  const query = searchParams.toString()
  const endpoint = query ? `/api/messages?${query}` : '/api/messages'

  return apiRequest<Message[]>(endpoint)
}

export async function getMessageAttachment(
  messageId: string,
  index: number,
): Promise<MessageAttachment> {
  return apiRequest<MessageAttachment>(
    `/api/messages/${messageId}/attachments/${index}`,
  )
}

export type BatchAttachmentItem = {
  messageId: string
  index: number
  url?: string
  name: string
  type: string
}

export async function getMessageAttachmentsBatch(
  items: Array<{ messageId: string; index: number }>,
): Promise<BatchAttachmentItem[]> {
  const response = await apiRequest<{ attachments: BatchAttachmentItem[] }>(
    '/api/messages/attachments/batch',
    {
      method: 'POST',
      body: JSON.stringify({ items }),
    },
  )

  return response.attachments
}

export async function createMessage(params: {
  chatId: string
  content: string
  attachments?: MessageAttachment[]
}): Promise<Message> {
  return apiRequest<Message>('/api/messages', {
    method: 'POST',
    body: JSON.stringify(params),
  })
}

export async function markMessagesAsRead(
  chatId: string,
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/messages/read/${chatId}`, {
    method: 'PATCH',
  })
}

export async function updateMessage(
  messageId: string,
  content: string,
): Promise<Message> {
  return apiRequest<Message>(`/api/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ content }),
  })
}

export async function deleteMessage(
  messageId: string,
): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/messages/${messageId}`, {
    method: 'DELETE',
  })
}