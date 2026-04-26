import type { Chat } from '../api/chats'

const STORAGE_KEY = 'campustalk_chats'

export function saveChats(chats: Chat[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats))
}

export function loadChats(): Chat[] {
  const data = localStorage.getItem(STORAGE_KEY)

  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}