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
import {
  mergeCachedWithServerSnapshot,
  mergeMessagesByIdChronological,
} from '../utils/mergeMessages'
import {
  cacheMessageAttachments,
  hydrateMessagesFromAttachmentCache,
  prefetchRecentAttachments,
} from '../utils/attachmentCache'
import { filterMessagesBeforeBlock, isMessageAfterBlock } from '../utils/blockedMessages'
import {
  getFileSizeLimitMessage,
  isDataUrlWithinSizeLimit,
} from '../utils/fileValidation'
import { refreshAuthUserProfile } from '../hooks/useSyncUserProfile'
import { useAuthStore } from '../store/authStore'
import { ApiError } from '../api/client'
import { socket } from '../socket'
import toast from 'react-hot-toast'

export function useChatMessages(chatId?: string) {
  const currentUser = useAuthStore((s) => s.user)
  const isBlocked = currentUser?.isBlocked === true
  const blockedAt = currentUser?.blockedAt

  const applyBlockFilter = useCallback(
    (items: Message[]) =>
      filterMessagesBeforeBlock(items, isBlocked, blockedAt),
    [isBlocked, blockedAt],
  )

  const readCached = useCallback(() => {
    if (!chatId) return []

    return applyBlockFilter(loadCachedMessages(chatId))
  }, [chatId, applyBlockFilter])

  const [messages, setMessages] = useState<Message[]>(() => {
    if (!chatId) return []

    const user = useAuthStore.getState().user

    return filterMessagesBeforeBlock(
      loadCachedMessages(chatId),
      user?.isBlocked === true,
      user?.blockedAt,
    )
  })
  const [isLoading, setIsLoading] = useState(() => {
    if (!chatId) return true

    return loadCachedMessages(chatId).length === 0
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingEarlier, setIsLoadingEarlier] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const syncRef = useRef<() => Promise<void>>(async () => {})

  const loadMessages = useCallback(async () => {
    if (!chatId) return

    const cached = readCached()
    const hasCachedMessages = cached.length > 0

    if (hasCachedMessages) {
      setIsLoading(false)
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      if (hasCachedMessages) {
        setMessages(cached)
      }

      const data = await getMessages({
        chatId,
        limit: 30,
      })

      const merged = applyBlockFilter(
        mergeCachedWithServerSnapshot(readCached(), data),
      )

      setMessages(merged)
      saveMessages(chatId, merged)

      if (!isBlocked) {
        void markMessagesAsRead(chatId)
      }

      void (async () => {
        const hydrated = await hydrateMessagesFromAttachmentCache(merged)
        setMessages(hydrated)

        const withRecentAttachments = await prefetchRecentAttachments(hydrated)
        setMessages(withRecentAttachments)
        saveMessages(chatId, withRecentAttachments)
      })()
    } catch {
      if (!hasCachedMessages) {
        console.log('Офлайн: немає кешованих повідомлень')
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [chatId, isBlocked, readCached, applyBlockFilter])

  const syncPendingMessages = useCallback(async () => {
    if (!chatId || isBlocked) return

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

        currentMessages = currentMessages.map((m) =>
          m._id === pendingMessage._id
            ? { ...savedMessage, localStatus: 'sent' as const }
            : m,
        )

        void cacheMessageAttachments(
          savedMessage._id,
          savedMessage.attachments?.length
            ? savedMessage.attachments
            : pendingMessage.attachments,
        )

        setMessages(currentMessages)
        saveMessages(chatId, currentMessages)
      } catch {
        break
      }
    }

    await loadMessages()
  }, [chatId, isBlocked, loadMessages])

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

    if (currentUser?.isBlocked === true) {
      toast.error('Ваш акаунт заблоковано')
      return
    }

    const trimmedText = text.trim()
    if (!trimmedText && attachments.length === 0) return

    for (const attachment of attachments) {
      if (!isDataUrlWithinSizeLimit(attachment.url)) {
        toast.error(getFileSizeLimitMessage(attachment.name))
        return
      }
    }

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

    void refreshAuthUserProfile().then((profile) => {
      if (profile?.isBlocked === true) {
        toast.error('Ваш акаунт заблоковано')
      }
    })

    try {
      setIsSending(true)

      const savedMessage = await createMessage({
        chatId,
        content: trimmedText,
        attachments,
      })

      const updatedMessages = nextMessages.map((message) =>
        message._id === tempId
          ? {
              ...savedMessage,
              attachments:
                savedMessage.attachments?.length
                  ? savedMessage.attachments
                  : message.attachments,
              localStatus: 'sent' as const,
            }
          : message,
      )

      void cacheMessageAttachments(
        savedMessage._id,
        updatedMessages.find((message) => message._id === savedMessage._id)
          ?.attachments,
      )

      setMessages(updatedMessages)
      saveMessages(chatId, updatedMessages)
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        try {
          const profile = await refreshAuthUserProfile()

          if (profile?.isBlocked === true) {
            toast.error('Ваш акаунт заблоковано')
          } else {
            toast.error('Не вдалося надіслати повідомлення')
          }
        } catch {
          toast.error('Не вдалося надіслати повідомлення')
        }
      }

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

      const mergedMessages = applyBlockFilter([...earlierMessages, ...messages])

      setMessages(mergedMessages)
      saveMessages(chatId, mergedMessages)

      void (async () => {
        const hydrated = await hydrateMessagesFromAttachmentCache(mergedMessages)
        const withAttachments = await prefetchRecentAttachments(hydrated)

        setMessages(withAttachments)
        saveMessages(chatId, withAttachments)
      })()
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

      const updatedMessages = pendingMessages.map((message) =>
        message._id === messageId
          ? {
              ...savedMessage,
              localStatus: 'sent' as const,
            }
          : message,
      )

      void cacheMessageAttachments(
        savedMessage._id,
        savedMessage.attachments?.length
          ? savedMessage.attachments
          : messageToRetry.attachments,
      )

      setMessages(updatedMessages)
      saveMessages(chatId, updatedMessages)
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      }

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
    if (!chatId || !isBlocked || !blockedAt) return

    setMessages((prev) => {
      const filtered = applyBlockFilter(prev)

      if (filtered.length === prev.length) return prev

      saveMessages(chatId, filtered)
      return filtered
    })
  }, [chatId, isBlocked, blockedAt, applyBlockFilter])

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
      if (isBlocked) return

      if (isMessageAfterBlock(message.createdAt, isBlocked, blockedAt)) return

      const messageChatId =
        typeof message.chatId === 'string'
          ? message.chatId
          : message.chatId._id

      if (messageChatId !== chatId) return

      void markMessagesAsRead(chatId)
      void cacheMessageAttachments(message._id, message.attachments)

      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === message._id)

        if (alreadyExists) return prev

        const nextMessages = applyBlockFilter(
          mergeMessagesByIdChronological(prev, [message]),
        )
        saveMessages(chatId, nextMessages)

        return nextMessages
      })

      void (async () => {
        const [hydratedMessage] = await hydrateMessagesFromAttachmentCache([
          message,
        ])

        setMessages((prev) => {
          const index = prev.findIndex((m) => m._id === message._id)

          if (index === -1) return prev

          const next = [...prev]
          next[index] = hydratedMessage
          saveMessages(chatId, next)
          return next
        })
      })()
    }

    socket.on('new-message', handleNewMessage)

    return () => {
      socket.off('new-message', handleNewMessage)
    }
  }, [chatId, isBlocked, blockedAt, applyBlockFilter])

  useEffect(() => {
    if (!chatId) return

    function handleEdit(message: Message) {
      if (isBlocked || isMessageAfterBlock(message.createdAt, isBlocked, blockedAt)) {
        return
      }

      if (message.chatId._id !== chatId) return

      setMessages((prev) => {
        const next = prev.map((m) => (m._id === message._id ? message : m))
        saveMessages(chatId, next)
        return next
      })
    }

    function handleDelete(data: { messageId: string; chatId: string }) {
      if (data.chatId !== chatId) return

      setMessages((prev) => {
        const next = prev.filter((m) => m._id !== data.messageId)
        saveMessages(chatId, next)
        return next
      })
    }

    socket.on('message-edited', handleEdit)
    socket.on('message-deleted', handleDelete)

    return () => {
      socket.off('message-edited', handleEdit)
      socket.off('message-deleted', handleDelete)
    }
  }, [chatId, isBlocked, blockedAt])

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
    isRefreshing,
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
