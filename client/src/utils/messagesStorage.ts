import type { Message } from '../api/messages'

function getMessagesStorageKey(chatId: string) {
  return `campustalk_messages_${chatId}`
}

function stripAttachmentUrls(messages: Message[]): Message[] {
  return messages.map((message) => ({
    ...message,
    attachments: message.attachments?.map(({ name, type }) => ({
      name,
      type,
    })),
  }))
}

export function saveMessages(chatId: string, messages: Message[]) {
  try {
    localStorage.setItem(
      getMessagesStorageKey(chatId),
      JSON.stringify(stripAttachmentUrls(messages)),
    )
  } catch {
    // Ignore quota errors so online sending still works.
  }
}

export function loadMessages(chatId: string): Message[] {
  const data = localStorage.getItem(getMessagesStorageKey(chatId))

  if (!data) return []

  try {
    return stripAttachmentUrls(JSON.parse(data))
  } catch {
    return []
  }
}
