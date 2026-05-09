import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createMessage,
  getMessages,
  markMessagesAsRead,
  updateMessage,
  deleteMessage,
  type Message,
} from '../api/messages'
import {
  saveMessages,
  loadMessages as loadCachedMessages,
} from '../utils/messagesStorage'
import { mergeMessagesByIdChronological } from '../utils/mergeMessages'
import { useAuthStore } from '../store/authStore'
import { socket } from '../socket'
import toast from 'react-hot-toast'

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

      await markMessagesAsRead(chatId)

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
          attachments: pendingMessage.attachments,
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

  const sendMessage = async (
    text: string,
    attachments: {
      url: string
      name: string
      type: string
    }[] = [],
  ) => {
    if (!chatId) return

    const trimmedText = text.trim()
    if (!trimmedText && attachments.length === 0) return

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
      attachments,
    }

    const nextMessages = [...messages, optimisticMessage]

    setMessages(nextMessages)
    saveMessages(chatId, nextMessages)

    try {
      setIsSending(true)

      const savedMessage = await createMessage({
        chatId,
        content: trimmedText,
        attachments,
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
      const failedMessages = nextMessages.map((message) =>
        message._id === tempId
          ? {
              ...message,
              localStatus: 'failed' as const,
            }
          : message,
      )
    
      setMessages(failedMessages)
      saveMessages(chatId, failedMessages)
    } finally {
      setIsSending(false)
    }
  }

  const editMessage = async (messageId: string, content: string) => {
    try {
      const updated = await updateMessage(messageId, content)
  
      setMessages((prev) => {
        const next = prev.map((m) =>
          m._id === messageId ? updated : m,
        )
        saveMessages(chatId!, next)
        return next
      })
  
      socket.emit('edit-message', updated)
    } catch {
      toast.error('Не вдалося відредагувати повідомлення')
    }
  }
  
  const removeMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId)
  
      setMessages((prev) => {
        const next = prev.filter((m) => m._id !== messageId)
        saveMessages(chatId!, next)
        return next
      })
  
      socket.emit('delete-message', { messageId, chatId })
    } catch {
      toast.error('Не вдалося видалити повідомлення')
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

  const retryMessage = async (messageId: string) => {
    if (!chatId) return
  
    const messageToRetry = messages.find((message) => message._id === messageId)
  
    if (!messageToRetry) return
  
    const pendingMessages = messages.map((message) =>
      message._id === messageId
        ? {
            ...message,
            localStatus: 'pending' as const,
          }
        : message,
    )
  
    setMessages(pendingMessages)
    saveMessages(chatId, pendingMessages)
  
    try {
      const savedMessage = await createMessage({
        chatId,
        content: messageToRetry.content,
        attachments: messageToRetry.attachments,
      })
  
      socket.emit('send-message', savedMessage)
  
      const updatedMessages = pendingMessages.map((message) =>
        message._id === messageId
          ? {
              ...savedMessage,
              localStatus: 'sent' as const,
            }
          : message,
      )
  
      setMessages(updatedMessages)
      saveMessages(chatId, updatedMessages)
    } catch {
      const failedMessages = pendingMessages.map((message) =>
        message._id === messageId
          ? {
              ...message,
              localStatus: 'failed' as const,
            }
          : message,
      )
  
      setMessages(failedMessages)
      saveMessages(chatId, failedMessages)
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
  
    async function handleNewMessage(message: Message) {
      const messageChatId =
        typeof message.chatId === 'string'
          ? message.chatId
          : message.chatId._id
    
      if (messageChatId !== chatId) return
    
      void markMessagesAsRead(chatId)
    
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === message._id)
    
        if (alreadyExists) return prev
    
        const nextMessages = mergeMessagesByIdChronological(prev, [message])
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

  useEffect(() => {
    if (!chatId) return
  
    function handleEdit(message: Message) {
      if (message.chatId._id !== chatId) return
  
      setMessages((prev) =>
        prev.map((m) => (m._id === message._id ? message : m)),
      )
    }
  
    function handleDelete(data: { messageId: string; chatId: string }) {
      if (data.chatId !== chatId) return
  
      setMessages((prev) =>
        prev.filter((m) => m._id !== data.messageId),
      )
    }
  
    socket.on('message-edited', handleEdit)
    socket.on('message-deleted', handleDelete)
  
    return () => {
      socket.off('message-edited', handleEdit)
      socket.off('message-deleted', handleDelete)
    }
  }, [chatId])

  return {
    messages,
    isLoading,
    isSending,
    isLoadingEarlier,
    hasMoreMessages,
    sendMessage,
    editMessage,
    removeMessage,
    loadEarlierMessages,
    retryMessage,
  }
}
