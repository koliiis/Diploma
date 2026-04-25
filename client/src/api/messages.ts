import { API_URL } from '../config/api'

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
  }
  
  export async function getMessages(chatId?: string): Promise<Message[]> {
    const url = chatId
      ? `${API_URL}/api/messages?chatId=${chatId}`
      : `${API_URL}/api/messages`
  
    const response = await fetch(url)
  
    if (!response.ok) {
      throw new Error('Failed to fetch messages')
    }
  
    return response.json()
  }
  
  export async function createMessage(params: {
    chatId: string
    content: string
  }): Promise<Message> {
    const response = await fetch(`${API_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
  
    if (!response.ok) {
      throw new Error('Failed to create message')
    }
  
    return response.json()
  }