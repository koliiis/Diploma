import { useEffect } from 'react'
import { socket } from '../socket'

export function useSocketJoinChat(chatId: string | undefined) {
  useEffect(() => {
    if (!chatId) return

    const join = () => {
      socket.emit('join-chat', chatId)
    }

    join()
    socket.on('connect', join)

    return () => {
      socket.off('connect', join)
    }
  }, [chatId])
}
