import { useEffect } from 'react'
import { socket } from '../socket'

export function useSocketJoinChat(chatId: string | undefined) {
  useEffect(() => {
    if (!chatId) return
    socket.emit('join-chat', chatId)
  }, [chatId])
}
