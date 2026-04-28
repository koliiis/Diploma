export type UserRole = 'student' | 'teacher'

export type User = {
  id: string
  fullName: string
  email: string
  role: UserRole
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  group?: string
}

export type Course = {
  id: string
  title: string
  description: string
  teacherId: string
  studentIds: string[]
  createdAt: string
  updatedAt: string
}

export type ChatType = 'course' | 'direct'

export type Chat = {
  id: string
  title: string
  courseId?: string
  participantIds: string[]
  type: ChatType
  createdAt: string
  updatedAt: string
}

export type MessageStatus = 'sent' | 'read'

export type Message = {
  id: string
  chatId: string
  authorId: string
  content: string
  status: MessageStatus
  createdAt: string
  updatedAt: string
}