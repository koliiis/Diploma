import { useEffect, useState } from 'react'
import { createMessage, getMessages, type Message } from '../api/messages'
import {
  saveMessages,
  loadMessages as loadCachedMessages,
} from '../utils/messagesStorage'

export function useChatMessages(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  async function loadMessages() {
    if (!chatId) return

    const cached = loadCachedMessages(chatId)

    if (cached.length > 0) {
      setMessages(cached)
      setIsLoading(false)
    }

    try {
      const data = await getMessages(chatId)
      setMessages(data)
      saveMessages(chatId, data)
    } catch {
      if (cached.length === 0) {
        console.log('Offline mode: no cached messages')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (text: string) => {
    if (!chatId) return

    const trimmedText = text.trim()
    if (!trimmedText) return

    const tempId = crypto.randomUUID()

    const optimisticMessage: Message = {
      _id: tempId,
      content: trimmedText,
      createdAt: new Date().toISOString(),
      authorId: {
        _id: 'local-user',
        fullName: 'You',
        email: 'local@example.com',
      },
      chatId: {
        _id: chatId,
        title: 'Current chat',
      },
      localStatus: 'pending',
    }

    const nextMessages = [...messages, optimisticMessage]

    setMessages(nextMessages)
    saveMessages(chatId, nextMessages)

    try {
      setIsSending(true)

      const savedMessage = await createMessage({
        chatId,
        content: trimmedText,
      })

      const updatedMessages = nextMessages.map((message) =>
        message._id === tempId
          ? {
              ...savedMessage,
              localStatus: 'sent' as const,
            }
          : message,
      )

      setMessages(updatedMessages)
      saveMessages(chatId, updatedMessages)
    } catch {
      const pendingMessages = nextMessages.map((message) =>
        message._id === tempId
          ? {
              ...message,
              localStatus: 'pending' as const,
            }
          : message,
      )

      setMessages(pendingMessages)
      saveMessages(chatId, pendingMessages)
    } finally {
      setIsSending(false)
    }
  }

  const syncPendingMessages = async () => {
    if (!chatId) return

    const cached = loadCachedMessages(chatId)
    const pendingMessages = cached.filter(
      (m) => m.localStatus === 'pending',
    )

    if (pendingMessages.length === 0) return

    let currentMessages = cached

    for (const pendingMessage of pendingMessages) {
      try {
        const savedMessage = await createMessage({
          chatId,
          content: pendingMessage.content,
        })

        currentMessages = currentMessages.map((m) =>
          m._id === pendingMessage._id
            ? { ...savedMessage, localStatus: 'sent' as const }
            : m,
        )

        setMessages(currentMessages)
        saveMessages(chatId, currentMessages)
      } catch {
        break
      }
    }

    await loadMessages()
  }

  useEffect(() => {
    loadMessages()
  }, [chatId])

  useEffect(() => {
    function handleOnline() {
      syncPendingMessages()
    }

    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [chatId])

  return {
    messages,
    isLoading,
    isSending,
    sendMessage,
  }
}