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
    const response = await fetch('http://127.0.0.1:4000/api/chats')
  
    if (!response.ok) {
      throw new Error('Failed to fetch chats')
    }
  
    return response.json()
  }