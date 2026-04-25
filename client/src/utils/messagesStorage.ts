import type { Message } from '../api/messages'

function getMessagesStorageKey(chatId: string) {
  return `campustalk_messages_${chatId}`
}

export function saveMessages(chatId: string, messages: Message[]) {
  localStorage.setItem(getMessagesStorageKey(chatId), JSON.stringify(messages))
}

export function loadMessages(chatId: string): Message[] {
  const data = localStorage.getItem(getMessagesStorageKey(chatId))

  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}