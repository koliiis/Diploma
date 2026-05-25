import { useEffect } from 'react'
import { getChats } from '../api/chats'
import { loadChats, saveChats } from '../utils/chatsStorage'
import { socket } from '../socket'
import { useCachedListFetch } from './useCachedListFetch'

export function useChatsList() {
  const listState = useCachedListFetch({
    loadCache: loadChats,
    saveCache: saveChats,
    fetch: getChats,
    fetchErrorMessage: 'Не вдалося завантажити чати',
  })

  const { data, refetch } = listState

  useEffect(() => {
    const joinAll = () => {
      data.forEach((chat) => {
        socket.emit('join-chat', chat._id)
      })
    }

    joinAll()
    socket.on('connect', joinAll)

    return () => {
      socket.off('connect', joinAll)
    }
  }, [data])

  useEffect(() => {
    function handleChatListUpdated() {
      void refetch()
    }

    socket.on('chat-list-updated', handleChatListUpdated)

    return () => {
      socket.off('chat-list-updated', handleChatListUpdated)
    }
  }, [refetch])

  return listState
}
