const STORAGE_KEY = 'campustalk_pinned_chats'

export function loadPinnedChatIds(): string[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []

  try {
    return JSON.parse(data)
  } catch {
    return []
  }
}

export function savePinnedChatIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}