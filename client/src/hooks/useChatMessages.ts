import { useCallback, useEffect, useRef, useState } from 'react'
import { createMessage, getMessages, type Message } from '../api/messages'
import {
  saveMessages,
  loadMessages as loadCachedMessages,
} from '../utils/messagesStorage'
import { mergeMessagesByIdChronological } from '../utils/mergeMessages'
import { useAuthStore } from '../store/authStore'
import { socket } from '../socket'

export function useChatMessages(chatId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const currentUser = useAuthStore((s) => s.user)
  const syncRef = useRef<() => Promise<void>>(async () => {})

  const loadMessages = useCallback(async () => {
    if (!chatId) return

    const cached = loadCachedMessages(chatId)

    if (cached.length > 0) {
      setMessages(cached)
      setIsLoading(false)
    }

    try {
      const data = await getMessages({
        chatId,
        limit: 30,
      })

      const latestCached = loadCachedMessages(chatId)
      const merged = mergeMessagesByIdChronological(latestCached, data)

      setMessages(merged)
      saveMessages(chatId, merged)
    } catch {
      if (cached.length === 0) {
        console.log('Офлайн: немає кешованих повідомлень')
      }
    } finally {
      setIsLoading(false)
    }
  }, [chatId])

  const syncPendingMessages = useCallback(async () => {
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

        socket.emit('send-message', savedMessage)

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
  }, [chatId, loadMessages])

  useEffect(() => {
    syncRef.current = syncPendingMessages
  }, [syncPendingMessages])

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
        _id: currentUser?._id ?? 'local-user',
        fullName: currentUser?.fullName ?? 'Ви',
        email: currentUser?.email ?? 'local@example.com',
      },
      chatId: {
        _id: chatId,
        title: 'Поточний чат',
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

      socket.emit('send-message', savedMessage)

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

  const loadEarlierMessages = async () => {
    if (!chatId || messages.length === 0) return

    const oldestMessage = messages[0]

    try {
      setIsLoadingEarlier(true)

      const earlierMessages = await getMessages({
        chatId,
        before: oldestMessage.createdAt,
        limit: 30,
      })

      if (earlierMessages.length === 0) {
        setHasMoreMessages(false)
        return
      }

      const mergedMessages = [...earlierMessages, ...messages]

      setMessages(mergedMessages)
      saveMessages(chatId, mergedMessages)
    } finally {
      setIsLoadingEarlier(false)
    }
  }

  useEffect(() => {
    if (!chatId) {
      return
    }

    const run = () => {
      void loadMessages()
    }
    queueMicrotask(run)
  }, [chatId, loadMessages])

  useEffect(() => {
    if (!chatId) return
  
    function handleNewMessage(message: Message) {
      if (message.chatId._id !== chatId) return
  
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === message._id)
  
        if (alreadyExists) {
          return prev
        }
  
        const nextMessages = [...prev, message]
        saveMessages(chatId, nextMessages)
  
        return nextMessages
      })
    }
  
    socket.on('new-message', handleNewMessage)
  
    return () => {
      socket.off('new-message', handleNewMessage)
    }
  }, [chatId])

  useEffect(() => {
    const handleOnline = () => {
      void syncRef.current()
    }

    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return {
    messages,
    isLoading,
    isSending,
    isLoadingEarlier,
    hasMoreMessages,
    sendMessage,
    loadEarlierMessages,
  }
}
