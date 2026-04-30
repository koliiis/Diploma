import { useEffect } from 'react'
import { getChats } from '../api/chats'
import { loadChats, saveChats } from '../utils/chatsStorage'
import { socket } from '../socket'
import { useCachedListFetch } from './useCachedListFetch'

export function useChatsList() {
  const result = useCachedListFetch({
    loadCache: loadChats,
    saveCache: saveChats,
    fetch: getChats,
    fetchErrorMessage: 'Не вдалося завантажити чати',
  })

  useEffect(() => {
    result.data.forEach((chat) => {
      socket.emit('join-chat', chat._id)
    })
  }, [result.data])

  useEffect(() => {
    function handleChatListUpdated() {
      void result.refetch()
    }

    socket.on('chat-list-updated', handleChatListUpdated)

    return () => {
      socket.off('chat-list-updated', handleChatListUpdated)
    }
  }, [result.refetch])

  return result
}